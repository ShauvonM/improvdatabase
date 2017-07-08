"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var app_http_1 = require("../../data/app-http");
var app_component_1 = require("../../component/app.component");
var user_service_1 = require("../../service/user.service");
//TODO: import models
var ContactComponent = (function () {
    function ContactComponent(_app, router, route, http, userService) {
        this._app = _app;
        this.router = router;
        this.route = route;
        this.http = http;
        this.userService = userService;
        this.title = '<span class="light">contact</span><strong>us</strong>';
        this.tabs = [
            {
                name: 'Request a Feature',
                id: 'featurerequest',
                icon: 'exclamation-circle'
            },
            {
                name: 'Report a Bug',
                id: 'reportbug',
                icon: 'bug'
            }
        ];
        this.selectedTab = 'featurerequest';
        this._tools = [];
    }
    ContactComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.forEach(function (params) {
            _this.selectedTab = params['type'] || 'featurerequest';
        });
        this.name = this.userService.getUserName() || 'A humble user';
        this.email = this.userService.getLoggedInUser().email;
    };
    ContactComponent.prototype.selectTab = function (tab) {
        this.selectedTab = tab.id;
        this._app.setPath('/app/contact/' + tab.id);
        this.error = "";
        this.errorField = "";
    };
    ContactComponent.prototype.sendFeatureRequest = function () {
        var _this = this;
        if (!this.featureMessage) {
            this.error = "We appreciate the attention, but you should actually say something.";
            this.errorField = 'message';
        }
        else {
            this.error = "";
            this.errorField = "";
            this.sending = true;
            this._app.showLoader();
            this.http.post('/api/contact/featurerequest', {
                message: this.featureMessage
            })
                .toPromise()
                .then(function (response) {
                _this._app.hideLoader();
                _this.sending = false;
                _this.sent = true;
            });
        }
    };
    ContactComponent.prototype.sendBugReport = function () {
        var _this = this;
        if (!this.bugTryingTo && !this.bugExpectation && !this.bugReality && !this.bugSteps) {
            this.error = "We are truly sorry that you encountered a problem. However, you should probably give us some clue as to what it was.";
        }
        else {
            this.error = '';
            this.sending = true;
            this._app.showLoader();
            this.http.post('/api/contact/bugreport', {
                tryingTo: this.bugTryingTo,
                expectation: this.bugExpectation,
                reality: this.bugReality,
                steps: this.bugSteps
            })
                .toPromise()
                .then(function (response) {
                _this._app.hideLoader();
                _this.sending = false;
                _this.sent = true;
            });
        }
    };
    ContactComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "contact",
            templateUrl: "../template/contact.component.html",
            styles: ["\n        #contactSigOutput {\n            font-family: 'Alex Brush';\n            font-size: 52px;\n            transform: rotateZ(-5deg);\n            transform-origin: 0%;\n            color: #333;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            router_1.ActivatedRoute,
            app_http_1.AppHttp,
            user_service_1.UserService])
    ], ContactComponent);
    return ContactComponent;
}());
exports.ContactComponent = ContactComponent;

//# sourceMappingURL=contact.component.js.map
