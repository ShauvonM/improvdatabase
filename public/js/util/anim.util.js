"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var animations_1 = require("@angular/animations");
var DEFAULT_DURATION = 200;
var DEFAULT_EASE = 'ease-in-out';
// bouncing
var EASE_IN_BACK = 'cubic-bezier(0.600, -0.280, 0.735, 0.045)';
var EASE_OUT_BACK = 'cubic-bezier(0.175, 0.885, 0.320, 1.275)';
var DialogAnim = (function () {
    function DialogAnim() {
    }
    DialogAnim.instyle = {
        transform: 'scale(1)',
        opacity: 1
    };
    DialogAnim.outstyle = {
        transform: 'scale(0.1)',
        opacity: 0
    };
    DialogAnim.dialog = animations_1.trigger('dialog', [
        animations_1.state('default', animations_1.style(DialogAnim.instyle)),
        animations_1.state('shake', animations_1.style(DialogAnim.instyle)),
        animations_1.state('runaway', animations_1.style({
            transform: 'scale(1) rotateZ(0)'
        })),
        animations_1.transition('void => *', [
            animations_1.style(DialogAnim.outstyle),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + EASE_OUT_BACK)
        ]),
        animations_1.transition('default => void', [
            animations_1.animate(DEFAULT_DURATION + 'ms ' + EASE_IN_BACK, animations_1.style(DialogAnim.outstyle))
        ]),
        animations_1.transition('default => shake', [
            animations_1.animate('350ms', animations_1.keyframes([
                animations_1.style({ transform: 'translateX(0px)', offset: 0 }),
                animations_1.style({ transform: 'translateX(20px)', offset: 0.1 }),
                animations_1.style({ transform: 'translateX(-20px)', offset: 0.3 }),
                animations_1.style({ transform: 'translateX(20px)', offset: 0.5 }),
                animations_1.style({ transform: 'translateX(-20px)', offset: 0.7 }),
                animations_1.style({ transform: 'translateX(20px)', offset: 0.9 }),
                animations_1.style({ transform: 'translateX(0px)', offset: 1 })
            ]))
        ]),
        animations_1.transition('runaway => void', [
            animations_1.group([
                animations_1.animate('3s 2s ease-in-out', animations_1.style({ transform: 'scale(0) rotateZ(560deg)' })),
                animations_1.animate('3s 2s linear', animations_1.keyframes([
                    animations_1.style({ left: '0px', top: '0px', offset: 0 }),
                    animations_1.style({ left: '18px', top: '27px', offset: 0.1 }),
                    animations_1.style({ left: '39px', top: '46px', offset: 0.2 }),
                    animations_1.style({ left: '54px', top: '52px', offset: 0.25 }),
                    animations_1.style({ left: '69px', top: '56px', offset: 0.3 }),
                    animations_1.style({ left: '87px', top: '51px', offset: 0.35 }),
                    animations_1.style({ left: '99px', top: '45px', offset: 0.4 }),
                    animations_1.style({ left: '119px', top: '27px', offset: 0.5 }),
                    animations_1.style({ left: '129px', top: '9px', offset: 0.55 }),
                    animations_1.style({ left: '132px', top: '-6px', offset: 0.6 }),
                    animations_1.style({ left: '126px', top: '-27px', offset: 0.65 }),
                    animations_1.style({ left: '119px', top: '-37px', offset: 0.7 }),
                    animations_1.style({ left: '91px', top: '-66px', offset: 0.8 }),
                    animations_1.style({ left: '54px', top: '-91px', offset: 0.9 }),
                    animations_1.style({ left: '12px', top: '-112px', offset: 1 })
                ]))
            ])
        ])
    ]);
    DialogAnim.starburst = animations_1.trigger('starburst', [
        animations_1.state('in', animations_1.style({ transform: 'translateX(12px) translateY(-112px) scale(0)' })),
        animations_1.transition('void => *', [
            // style({transform: 'translateX(12px) translateY(-112px) scale(0) rotateZ(360deg)'})
            animations_1.animate('1.5s 5.5s linear', animations_1.keyframes([
                animations_1.style({ transform: 'translateX(12px) translateY(-112px) scale(0) rotateZ(0)', offset: 0 }),
                animations_1.style({ transform: 'translateX(12px) translateY(-112px) scale(1) rotateZ(180deg)', offset: 0.5 }),
                animations_1.style({ transform: 'translateX(12px) translateY(-112px) scale(0) rotateZ(0)', offset: 1 })
            ]))
        ])
    ]);
    return DialogAnim;
}());
exports.DialogAnim = DialogAnim;
var ToggleAnim = (function () {
    function ToggleAnim() {
    }
    ToggleAnim.STYLE_IN = { opacity: 1 };
    ToggleAnim.STYLE_OUT = { opacity: 0 };
    ToggleAnim.STYLE_ABSOLUTE_OUT = {
        opacity: 0,
        position: 'absolute',
        top: 0
    };
    ToggleAnim.fade = animations_1.trigger('fade', [
        animations_1.state('in', animations_1.style(ToggleAnim.STYLE_IN)),
        animations_1.transition('void => *', [
            animations_1.style(ToggleAnim.STYLE_OUT),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE)
        ]),
        animations_1.transition('* => void', [
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, animations_1.style(ToggleAnim.STYLE_OUT))
        ])
    ]);
    ToggleAnim.fadeAbsolute = animations_1.trigger('fadeAbsolute', [
        animations_1.state('in', animations_1.style(ToggleAnim.STYLE_IN)),
        animations_1.transition('void => *', [
            animations_1.style(ToggleAnim.STYLE_ABSOLUTE_OUT),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE)
        ]),
        animations_1.transition('* => void', [
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, animations_1.style(ToggleAnim.STYLE_ABSOLUTE_OUT))
        ])
    ]);
    ToggleAnim.bubbleSlow = animations_1.trigger('bubbleSlow', [
        animations_1.state('in', animations_1.style(DialogAnim.instyle)),
        animations_1.transition('void => *', [
            animations_1.style(DialogAnim.outstyle),
            animations_1.animate((DEFAULT_DURATION * 2) + 'ms ' + EASE_OUT_BACK)
        ]),
        animations_1.transition('* => void', [
            animations_1.animate((DEFAULT_DURATION * 2) + 'ms ' + EASE_IN_BACK, animations_1.style(DialogAnim.outstyle))
        ])
    ]);
    ToggleAnim.bubble = animations_1.trigger('bubble', [
        animations_1.state('in', animations_1.style(DialogAnim.instyle)),
        animations_1.transition('void => *', [
            animations_1.style(DialogAnim.outstyle),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + EASE_OUT_BACK)
        ]),
        animations_1.transition('* => void', [
            animations_1.animate(DEFAULT_DURATION + 'ms ' + EASE_IN_BACK, animations_1.style(DialogAnim.outstyle))
        ])
    ]);
    return ToggleAnim;
}());
exports.ToggleAnim = ToggleAnim;
var ShrinkAnim = (function () {
    function ShrinkAnim() {
    }
    ShrinkAnim.verticalInStyle = {
        transform: 'scaleY(1)',
        opacity: 1
    };
    ShrinkAnim.verticalOutStyle = {
        transform: 'scaleY(0.1)',
        opacity: 0
    };
    ShrinkAnim.vertical = animations_1.trigger('shrinkVertical', [
        animations_1.state('in', animations_1.style(ShrinkAnim.verticalInStyle)),
        animations_1.transition('void => *', [
            animations_1.style(ShrinkAnim.verticalOutStyle),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE)
        ]),
        animations_1.transition('* => void', [
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, animations_1.style(ShrinkAnim.verticalOutStyle))
        ])
    ]);
    ShrinkAnim.heightInStyle = {
        height: '*',
        opacity: 1,
        overflow: 'hidden'
    };
    ShrinkAnim.heightOutStyle = {
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
    };
    ShrinkAnim.height = animations_1.trigger('shrinkHeight', [
        animations_1.state('in', animations_1.style(ShrinkAnim.heightInStyle)),
        animations_1.transition('void => *', [
            animations_1.style(ShrinkAnim.heightOutStyle),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, animations_1.style(ShrinkAnim.heightInStyle))
        ]),
        animations_1.transition('* => void', [
            animations_1.style(ShrinkAnim.heightInStyle),
            animations_1.animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, animations_1.style(ShrinkAnim.heightOutStyle))
        ])
    ]);
    return ShrinkAnim;
}());
exports.ShrinkAnim = ShrinkAnim;

//# sourceMappingURL=anim.util.js.map
