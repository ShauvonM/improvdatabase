import { Injectable } from '@angular/core';
import { 
    Headers,
    Http,
    Request,
    ConnectionBackend,
    RequestOptions,
    RequestOptionsArgs,
    Response
} from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../service/user.service';

@Injectable()
export class AppHttp {

    private TOKEN_STORAGE_KEY = 'improvdatabase_token';
    private EXPIRATION_STORAGE_KEY = 'improvdatabase_tokenExpires';

    private token: string;
    private tokenExpires: number;

    constructor(
        private http: Http,
        private router: Router
    ) {
        this.loadValues();
    }

    private loadValues(): void {
        this.token = localStorage.getItem(this.TOKEN_STORAGE_KEY);
        this.tokenExpires = parseInt(localStorage.getItem(this.EXPIRATION_STORAGE_KEY) || '0');
    }

    private saveValues(token: string, exp: number): void {
        this.token = token;
        this.tokenExpires = exp;
        localStorage.setItem(this.TOKEN_STORAGE_KEY, this.token);
        localStorage.setItem(this.EXPIRATION_STORAGE_KEY, '' + this.tokenExpires);
    }

    private clearValues(): void {
        localStorage.removeItem(this.TOKEN_STORAGE_KEY);
        localStorage.removeItem(this.EXPIRATION_STORAGE_KEY);
        this.token = null;
        this.tokenExpires = null;
    }

    checkTokenExpiration(): boolean {
        if (!this.token || !this.tokenExpires || this.tokenExpires <= Date.now()) {
            this.token = '';
            this.tokenExpires = null;
            return false;
        } else {
            return true;
        }
    }

    setToken(token: string, expires: number): void {
        this.saveValues(token, expires);
    }

    reset(): void {
        this.clearValues();
    }

    getToken(): string {
        return this.token;
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.request(url, this.getRequestOptionArgs(options)));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.get(url, this.getRequestOptionArgs(options)));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options)));
    }

    postFormData(url: string, body: FormData, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.post(url, body, this.getRequestOptionArgs(options, 'multipart/form-data')));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.put(url, body, this.getRequestOptionArgs(options)));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(this.http.delete(url, this.getRequestOptionArgs(options)));
    }
    
    appendAuthorizationHeader(headers: Headers): Headers {
        // TODO: somehow make this asynchronous so we can refresh the token if necessary?
        if (this.checkTokenExpiration()) {
            headers.append('x-access-token', this.token);
        }
        return headers;
    }

    getRequestOptionArgs(options?: RequestOptionsArgs, contentType?: string): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
            if (contentType !== 'multipart/form-data') {
                // angular will set up the multipart/form-data headers properly on its own
                options.headers.append('Content-Type', 'application/json');
            }
        }
        this.appendAuthorizationHeader(options.headers);
        return options;
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err, source) => {
            if (err.status == 401 && err.url.indexOf('/login') == -1) {
                if (err.url.indexOf('/refreshToken') > -1) {
                    // if the token refresh doesn't work, the user account has become invalid
                    this.reset();
                    this.router.navigate(['/welcome']);
                } else {
                    // redirect the user to the unauthorized page?
                    this.router.navigate(['/app/unauthorized']);
                }
                return Observable.empty();
            } else {
                return Observable.throw(err);
            }
        });
    }

}