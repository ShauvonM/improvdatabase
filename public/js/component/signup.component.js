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
var app_component_1 = require("./app.component");
var app_service_1 = require("../service/app.service");
var user_service_1 = require("../service/user.service");
var cart_service_1 = require("../service/cart.service");
var user_1 = require("../model/user");
var team_1 = require("../model/team");
var anim_util_1 = require("../util/anim.util");
var bracket_card_directive_1 = require("../directive/bracket-card.directive");
var config_1 = require("../model/config");
var SignupComponent = (function () {
    function SignupComponent(_app, _service, router, userService, cartService) {
        this._app = _app;
        this._service = _service;
        this.router = router;
        this.userService = userService;
        this.cartService = cartService;
        this.config = new config_1.PackageConfig();
        this.userType = 'facilitator';
        this.isLoadingPackages = false;
        this.isPosting = false;
        this.cardComplete = false;
    }
    SignupComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.userService.isLoggedIn()) {
            this.router.navigate(['/app/dashboard'], { replaceUrl: true });
        }
        this._app.showLoader();
        this._service.getPackageConfig().then(function (config) {
            _this.config = config;
            _this.setup();
        });
    };
    SignupComponent.prototype.setup = function () {
        var _this = this;
        this._app.showBackground(true);
        // this.isLoadingPackages = true;
        // this._service.getPackages().then(p => {
        //     this.isLoadingPackages = false;
        //     this.packages = p;
        // });
        this.stripe = Stripe(this._app.config.stripe);
        var elements = this.stripe.elements();
        this.creditCard = elements.create('card', {
            // value: {postalCode: this.user.zip},
            style: {
                base: {
                    color: '#32325d',
                    lineHeight: '24px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: 'rgba(96,96,96,0.5)'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        this.creditCard.addEventListener('change', function (e) {
            _this.cardComplete = e.complete;
            if (e.error) {
                _this.cardError = e.error.message;
            }
            else {
                _this.cardError = '';
            }
        });
        this._app.hideLoader();
    };
    SignupComponent.prototype.emailInput = function () {
        var _this = this;
        clearTimeout(this.emailTimer);
        this.emailError = '';
        this.emailTimer = setTimeout(function () {
            _this.validateEmail();
        }, 500);
    };
    SignupComponent.prototype.validateEmail = function () {
        var _this = this;
        var user = new user_1.User();
        if (this.email.indexOf('@') > -1 && this.email.indexOf('.') > -1) {
            user.email = this.email;
            this._service.validateUser(user).then(function (message) {
                _this.emailError = message;
            });
        }
        else if (this.email.length > 0) {
            this.emailError = 'This does not seem to be a valid email address.';
        }
        else {
            this.emailError = '';
        }
    };
    SignupComponent.prototype.teamInput = function () {
        var _this = this;
        clearTimeout(this.teamTimer);
        this.teamError = '';
        this.teamTimer = setTimeout(function () {
            _this.validateTeam();
        }, 500);
    };
    SignupComponent.prototype.validateTeam = function () {
        var _this = this;
        var team = new team_1.Team();
        team.name = this.teamName;
        this._service.validateTeam(team).then(function (message) {
            _this.teamError = message;
        });
    };
    SignupComponent.prototype.setPageHeight = function () {
        var page = this.pageElement.nativeElement, height = page.offsetHeight, currentMinHeight = page.style.minHeight ? parseInt(page.style.minHeight.replace('px', '')) : 0;
        if (height > currentMinHeight) {
            page.style.minHeight = page.offsetHeight + 'px';
        }
    };
    SignupComponent.prototype.selectCard = function (option, value, cardToOpen, cardToClose) {
        var _this = this;
        if (this[option] == value || cardToOpen.isOpen) {
            return;
        }
        this.setPageHeight();
        // this[option] = '';
        if (option == 'userType') {
            this.teamOption = '';
        }
        if (option == 'teamOption') {
            this.userName = '';
            this.teamName = '';
            this.setupPackages(value == 'team');
        }
        cardToOpen.open();
        cardToClose.close();
        setTimeout(function () {
            _this[option] = value;
        }, 600);
    };
    SignupComponent.prototype.reset = function () {
        var _this = this;
        this._app.scrollTo(0);
        this.cartService.reset();
        setTimeout(function () {
            _this.userType = '';
            _this.teamOption = '';
            _this.email = '';
            _this.password = '';
            _this.userName = '';
            _this.teamName = '';
            _this.selectedPackage = null;
            _this.facilitatorCard.reset(500);
            _this.improviserCard.reset(500);
        }, 400);
    };
    SignupComponent.prototype.selectFacilitator = function () {
        this.selectCard('userType', 'facilitator', this.facilitatorCard, this.improviserCard);
    };
    SignupComponent.prototype.selectImproviser = function () {
        this.selectCard('userType', 'improviser', this.improviserCard, this.facilitatorCard);
    };
    SignupComponent.prototype.selectYourself = function () {
        this.selectCard('teamOption', 'individual', this.yourselfCard, this.yourTeamCard);
    };
    SignupComponent.prototype.selectYourTeam = function () {
        this.selectCard('teamOption', 'team', this.yourTeamCard, this.yourselfCard);
    };
    SignupComponent.prototype.setupPackages = function (team) {
        var _this = this;
        this.selectedPackage = null;
        this.options = [];
        this._service.getPackages(this.userType, team).then(function (pkgs) {
            _this.options = pkgs;
        });
    };
    SignupComponent.prototype.selectPackage = function ($event, pack, cardClicked) {
        var _this = this;
        if (pack == this.selectedPackage) {
            return;
        }
        this.cartService.reset();
        this.setPageHeight();
        this.packageCards.forEach(function (card) {
            if (card.card != cardClicked) {
                card.close();
            }
            else {
                card.open();
            }
        });
        this.creditCard.unmount();
        setTimeout(function () {
            _this.selectedPackage = pack;
            if (_this.selectedPackage._id == 'sub') {
                var role = void 0;
                if (_this.userType == 'facilitator') {
                    if (_this.teamOption == 'team') {
                        role = _this.config.role_facilitator_team;
                    }
                    else {
                        role = _this.config.role_facilitator;
                    }
                }
                else if (_this.userType == 'improviser') {
                    if (_this.teamOption == 'team') {
                        role = _this.config.role_improviser_team;
                    }
                    else {
                        role = _this.config.role_improviser;
                    }
                }
                _this.cartService.addSubscription(role);
            }
            else {
                _this.cartService.addPackage(_this.selectedPackage);
            }
            // setup the stripe credit card input
            setTimeout(function () {
                _this.creditCard.mount('#card-element');
            }, 100);
        }, 100);
    };
    SignupComponent.prototype.isFormValid = function () {
        if (!this.email) {
            return false;
        }
        if (!this.password) {
            return false;
        }
        if (!this.teamOption || !this.userType) {
            return false;
        }
        if (this.teamOption == 'team' && !this.teamName) {
            return false;
        }
        if (this.teamOption == 'individual' && !this.userName) {
            return false;
        }
        if (this.cardError || !this.cardComplete || this.teamError) {
            return false;
        }
        if (!this.termsAccepted) {
            return false;
        }
        return true;
    };
    SignupComponent.prototype.submitPayment = function () {
        var _this = this;
        if (!this.isFormValid()) {
            return;
        }
        var user = new user_1.User();
        if (this.userName && this.userName.length) {
            var nameArray = this.userName.split(' ');
            if (nameArray[0]) {
                user.firstName = nameArray[0];
            }
            if (nameArray[1]) {
                user.lastName = nameArray[1];
            }
        }
        user.email = this.email;
        user.password = this.password;
        this._app.showLoader();
        this.isPosting = true;
        this.stripe.createToken(this.creditCard).then(function (result) {
            if (result.error) {
                _this.cardError = result.error.message;
            }
            else {
                _this.cartService.setUser(user);
                _this.cartService.signup(result.token, _this.email, _this.password, _this.userName, _this.teamName)
                    .catch(function (response) {
                    _this._app.hideLoader();
                    _this.isPosting = false;
                    var msg = response.json();
                    if (msg.error && msg.error == 'email already exists') {
                        _this.emailError = "That email address is already registered.";
                        // let card: HTMLElement = this.facilitatorCard.nativeElement;
                        // this._app.scrollTo(card.offsetTop);
                    }
                    else if (msg.error) {
                        _this._app.dialog('An error has occurred.', 'We are so sorry. Something happened, and we can\'t be sure what. Please try again, and if this keeps happening, reach out to us by emailing contact@improvpl.us. Have a nice day, dude.', 'Okay bye', null, true);
                    }
                })
                    .then(function (u) {
                    if (u && u.email) {
                        return _this.userService.login(user.email, user.password);
                    }
                    else {
                        // uh oh?
                        _this._app.hideLoader();
                    }
                });
            }
        });
    };
    SignupComponent.prototype.showTerms = function () {
        this._app.backdrop(true);
        this.termsDialogVisible = true;
    };
    SignupComponent.prototype.hideTerms = function () {
        this._app.backdrop(false);
        this.termsDialogVisible = false;
    };
    __decorate([
        core_1.ViewChild('page'),
        __metadata("design:type", core_1.ElementRef)
    ], SignupComponent.prototype, "pageElement", void 0);
    __decorate([
        core_1.ViewChild('facilitatorCard', { read: bracket_card_directive_1.BracketCardDirective }),
        __metadata("design:type", bracket_card_directive_1.BracketCardDirective)
    ], SignupComponent.prototype, "facilitatorCard", void 0);
    __decorate([
        core_1.ViewChild('improviserCard', { read: bracket_card_directive_1.BracketCardDirective }),
        __metadata("design:type", bracket_card_directive_1.BracketCardDirective)
    ], SignupComponent.prototype, "improviserCard", void 0);
    __decorate([
        core_1.ViewChild('yourselfCard', { read: bracket_card_directive_1.BracketCardDirective }),
        __metadata("design:type", bracket_card_directive_1.BracketCardDirective)
    ], SignupComponent.prototype, "yourselfCard", void 0);
    __decorate([
        core_1.ViewChild('yourTeamCard', { read: bracket_card_directive_1.BracketCardDirective }),
        __metadata("design:type", bracket_card_directive_1.BracketCardDirective)
    ], SignupComponent.prototype, "yourTeamCard", void 0);
    __decorate([
        core_1.ViewChildren('packageCard', { read: bracket_card_directive_1.BracketCardDirective }),
        __metadata("design:type", core_1.QueryList)
    ], SignupComponent.prototype, "packageCards", void 0);
    SignupComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "signup",
            templateUrl: '../template/signup.component.html',
            animations: [
                anim_util_1.ToggleAnim.fadeAbsolute,
                anim_util_1.ToggleAnim.bubble,
                anim_util_1.ToggleAnim.bubbleSlow,
                anim_util_1.DialogAnim.dialog
            ]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            app_service_1.AppService,
            router_1.Router,
            user_service_1.UserService,
            cart_service_1.CartService])
    ], SignupComponent);
    return SignupComponent;
}());
exports.SignupComponent = SignupComponent;

//# sourceMappingURL=signup.component.js.map
