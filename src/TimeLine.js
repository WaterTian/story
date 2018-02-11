const Script = require('./Script').default;

export default class TimeLine {
  constructor() {


    var skyColorScript = new Script();
    skyColorScript.addKeyframe({r:0, g: 0, b: 0},0);
    skyColorScript.addKeyframe({r:0xff, g: 0xff, b: 0xff},6);
    skyColorScript.addKeyframe({r:0x41, g: 0xa4, b: 0x84},22);
    skyColorScript.addKeyframe({r:0x41, g: 0xa4, b: 0x84},32);

    skyColorScript.addKeyframe({r:0x41, g: 0xa4, b: 0x84},40);
    skyColorScript.addKeyframe({r:0xff, g: 0x30, b: 0x80},60);

    skyColorScript.addKeyframe({r:0xff, g: 0x30, b: 0x80},70);
    skyColorScript.addKeyframe({r:0xfc, g: 0x79, b: 0xa5},80);

    skyColorScript.addKeyframe({r:0xfc, g: 0xda, b: 0xdb},100);
    skyColorScript.addKeyframe({r:0xd6, g: 0x86, b: 0xa6},110);
    skyColorScript.addKeyframe({r:0x30, g: 0x30, b: 0x30},120);
    skyColorScript.addKeyframe({r:0x30, g: 0x30, b: 0x30},130);
    this.skyColorScript = skyColorScript;


    var backdropScript = new Script();
    backdropScript.addKeyframe({a:1,fr: 0xff, fg: 0xff, fb: 0xff, tr: 0xff, rg: 0xff, tb: 0xff, rot:0 },0);
    backdropScript.addKeyframe({a:1,fr: 0xd3, fg: 0xe8, fb: 0xd9, tr: 0, rg: 0, tb: 0, rot:0 },28);
    backdropScript.addKeyframe({a:1,fr: 0xd3, fg: 0xe8, fb: 0xd9, tr: 0, rg: 0, tb: 0, rot: - Math.PI},34);

    backdropScript.addKeyframe({a:1,fr: 0xd3, fg: 0xe8, fb: 0xd9, tr: 0, rg: 0, tb: 0, rot: - Math.PI},40);
    backdropScript.addKeyframe({a:1,fr: 0xff, fg: 0x00, fb: 0x80, tr: 0x80, rg: 0, tb: 0xff, rot: -2 *Math.PI},60);

    backdropScript.addKeyframe({a:1,fr: 0xff, fg: 0x00, fb: 0x80, tr: 0x80, rg: 0, tb: 0xff, rot: -5 *Math.PI/2},70);
    backdropScript.addKeyframe({a:1,fr: 0xfc, fg: 0xda, fb: 0xdb, tr: 0xff, rg: 0xff, tb: 0xff, rot: -2 *Math.PI},90);
    backdropScript.addKeyframe({a:1,fr: 0x00, fg: 0x00, fb: 0x00, tr: 0x00, rg: 0x00, tb: 0x00,rot: -2 *Math.PI},110);
    backdropScript.addKeyframe({a:0,fr: 0xfc, fg: 0xda, fb: 0xdb, tr: 0x30, rg: 0x30, tb: 0x30, rot: -2 *Math.PI},115);
    backdropScript.addKeyframe({a:0,fr: 0xfc, fg: 0xda, fb: 0xdb, tr: 0x30, rg: 0x30, tb: 0x30, rot: -2 *Math.PI},125);
    backdropScript.addKeyframe({a:0,fr: 0, fg: 0, fb: 0, tr: 0, rg: 0, tb: 0, rot: -2 *Math.PI},130);
    this.backdropScript = backdropScript;



    var cameraScript = new Script();
    cameraScript.addKeyframe( {x:0,y:1.1,z:-2,tx:0,ty:-1,tz:.01},0);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2,tx:0,ty:-1,tz:.01},2);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:-1,tz:1},6);

    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:-1,tz:1},15);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:0,tz:1},18);
    cameraScript.addKeyframe( {x:0,y:1.1,z:-3,tx:0,ty:.5,tz:1},39);
    cameraScript.addKeyframe( {x:0,y:1.1,z:-3,tx:0,ty:0,tz:1},41);
    cameraScript.addKeyframe( {x:0,y:1.6,z:-3,tx:0,ty:0,tz:1},51);
    cameraScript.addKeyframe( {x:0,y:4,z:-4,tx:0,ty:0,tz:1},70);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2,tx:0,ty:0,tz:1},80);
    cameraScript.addKeyframe( {x:0,y:3,z:-3.5,tx:0,ty:0,tz:1},90);
    cameraScript.addKeyframe( {x:0,y:3,z:-2.5,tx:0,ty:0,tz:1},100);
    cameraScript.addKeyframe( {x:0,y:2,z:-3,tx:0,ty:5,tz:1},109);
    cameraScript.addKeyframe( {x:0,y:2,z:-3,tx:0,ty:1,tz:1},112);
    cameraScript.addKeyframe( {x:0,y:2,z:-3,tx:0,ty:0,tz:1},130);
    this.cameraScript = cameraScript;



    var snowScript = new Script();
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.4},0);
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.4},20);

    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.6},24);
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.6},52);

    snowScript.addKeyframe({persistence: 1., speed: .002, scale: .02, delta:2, opacity:.8},60);
    snowScript.addKeyframe({persistence: 1., speed: .002, scale: .02, delta:2, opacity:.8},95);

    snowScript.addKeyframe({persistence: 1., speed: .001, scale: .03, delta:1, opacity:.8},100);
    snowScript.addKeyframe({persistence: 1., speed: .001, scale: .03, delta:1, opacity:.8},130);
    this.snowScript = snowScript;


    var trailScript = new Script();
    trailScript.addKeyframe({opacity: 0., scale: .01,},0);
    trailScript.addKeyframe({opacity: 0., scale: .1,},15);
    trailScript.addKeyframe({opacity: .05, scale: .1,},22);
    trailScript.addKeyframe({opacity: .1, scale: .15,},38);
    trailScript.addKeyframe({opacity: .1, scale: .075,},42);
    trailScript.addKeyframe({opacity: .1, scale: .075,},130);
    this.trailScript = trailScript;
    
    var trailColorScript = new Script();
    trailColorScript.addKeyframe({r:0,g:0,b:0},0);
    trailColorScript.addKeyframe({r:0xff,g:0xff,b:0xff},3);
    trailColorScript.addKeyframe({r:0xff,g:0xff,b:0xff},38);
    trailColorScript.addKeyframe({r:0xff,g:0xea,b:0x3b},42);
    trailColorScript.addKeyframe({r:0xff,g:0xea,b:0x3b},130);
    this.trailColorScript = trailColorScript;



    var lightScript = new Script();
    lightScript.addKeyframe({overall: 0},0);
    lightScript.addKeyframe({overall: 1},3);
    lightScript.addKeyframe({overall: 1},123);
    lightScript.addKeyframe({overall: 1},130);
    this.lightScript = lightScript;


    var titleScript = new Script();
    titleScript.addKeyframe({opacity:0, y:0, title:0}, 0);
    titleScript.addKeyframe({opacity:0, y:-.5, title:0}, 8);
    titleScript.addKeyframe({opacity:1, y:0, title:0}, 11);

    titleScript.addKeyframe({opacity:1, y:0, title:0}, 16);
    titleScript.addKeyframe({opacity:0, y:.5, title:0}, 19);

    // titleScript.addKeyframe({opacity:0, y:-.5, title:1}, 22);
    // titleScript.addKeyframe({opacity:1, y:0, title:1}, 25);
    // titleScript.addKeyframe({opacity:1, y:0, title:1}, 30);
    // titleScript.addKeyframe({opacity:0, y:.5, title:1}, 33);

    titleScript.addKeyframe({opacity:0, y:-.5, title:2}, 105);
    titleScript.addKeyframe({opacity:1, y:0, title:2}, 109);
    titleScript.addKeyframe({opacity:0, y:.5, title:2}, 115);
    titleScript.addKeyframe({opacity:0, y:.5, title:2}, 130);
    this.titleScript = titleScript;


  }

  getValues(script,t)
  {
    var v = {};
    script.updateValues(t, v);
    return v;
  }
}