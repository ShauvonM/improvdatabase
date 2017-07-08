import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './module/app.module';

import { CONFIG_TOKEN } from './constants';

import { Promise } from 'es6-promise';
import 'whatwg-fetch';

if (!(<any> window).Promise) {
    (<any> window).Promise = Promise;
}

fetch('/config').then(response => {
    response.json().then(configData => {
        const platform = platformBrowserDynamic([{
            provide: CONFIG_TOKEN, useValue: configData
        }]);
        platform.bootstrapModule(AppModule);
    });
})

