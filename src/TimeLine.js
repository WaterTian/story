const Script = require('./Script').default;

export default class TimeLine {
  constructor() {

    var skyColorScript = new Script();
    skyColorScript.addKeyframe({r:0, g: 0, b: 0},0);
    skyColorScript.addKeyframe({r:0xa1, g: 0xb5, b: 0xd7},6);
    skyColorScript.addKeyframe({r:0xa1, g: 0xb5, b: 0xd7},38);
    skyColorScript.addKeyframe({r:0x30, g: 0x30, b: 0x30},42);
    skyColorScript.addKeyframe({r:0x30, g: 0x30, b: 0x30},80);
    skyColorScript.addKeyframe({r:0xff, g: 0x30, b: 0x80},90);
    skyColorScript.addKeyframe({r:0xff, g: 0x30, b: 0x80},120);
    skyColorScript.addKeyframe({r:0x30, g: 0x30, b: 0x30},130);
    skyColorScript.addKeyframe({r:0x30, g: 0x30, b: 0x30},200);
    this.skyColorScript = skyColorScript;


    var cameraScript = new Script();
    cameraScript.addKeyframe( {x:0,y:1.1,z:-2,tx:0,ty:-1,tz:.01},0);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:-1,tz:.01},2);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:-1,tz:1},6);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:-1,tz:1},20);
    cameraScript.addKeyframe( {x:0,y:1.3,z:-2.5,tx:0,ty:0,tz:1},24);
    cameraScript.addKeyframe( {x:0,y:1.1,z:-3,tx:0,ty:.5,tz:1},39);
    cameraScript.addKeyframe( {x:0,y:1.1,z:-3,tx:0,ty:0,tz:1},41);
    cameraScript.addKeyframe( {x:0,y:1.1,z:-4.5,tx:0,ty:0,tz:1},70);
    cameraScript.addKeyframe( {x:0,y:2,z:-3,tx:0,ty:0,tz:1},128);
    cameraScript.addKeyframe( {x:0,y:2,z:-3,tx:0,ty:10,tz:1},133);
    cameraScript.addKeyframe( {x:0,y:2,z:-3,tx:0,ty:10,tz:1},200);
    this.cameraScript = cameraScript;



    var snowScript = new Script();
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.4},0);
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.4},38);
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.6},42);
    snowScript.addKeyframe({persistence: .8, speed: .001, scale: .01, delta:1, opacity:.6},52);
    snowScript.addKeyframe({persistence: 1., speed: .002, scale: .02, delta:2, opacity:.8},60);
    snowScript.addKeyframe({persistence: 1., speed: .002, scale: .02, delta:2, opacity:.8},125);
    snowScript.addKeyframe({persistence: 1., speed: .001, scale: .03, delta:1, opacity:.8},130);
    snowScript.addKeyframe({persistence: 1., speed: .001, scale: .03, delta:1, opacity:.8},200);
    this.snowScript = snowScript;


    var trailColorScript = new Script();
    trailColorScript.addKeyframe({r:0,g:0,b:0},0);
    trailColorScript.addKeyframe({r:0xff,g:0xff,b:0xff},3);
    trailColorScript.addKeyframe({r:0xff,g:0xff,b:0xff},38);
    trailColorScript.addKeyframe({r:0xff,g:0xea,b:0x3b},42);
    trailColorScript.addKeyframe({r:0xff,g:0xea,b:0x3b},200);
    this.trailColorScript = trailColorScript;



    var lightScript = new Script();
    lightScript.addKeyframe({overall: 0},0);
    lightScript.addKeyframe({overall: 1},3);
    lightScript.addKeyframe({overall: 1},134);
    lightScript.addKeyframe({overall: 0},137);
    lightScript.addKeyframe({overall: 0},200);
    this.lightScript = lightScript;


    var backdropScript = new Script();
    backdropScript.addKeyframe({fr: 0xa1, fg: 0xb5, fb: 0xd7, tr: 0, rg: 0, tb: 0, rot: -Math.PI/2},0);
    backdropScript.addKeyframe({fr: 0xa1, fg: 0xb5, fb: 0xd7, tr: 0, rg: 0, tb: 0, rot: -Math.PI/2},38);
    backdropScript.addKeyframe({fr: 0xa1, fg: 0xb5, fb: 0xd7, tr: 0, rg: 0, tb: 0, rot: -Math.PI - Math.PI/2},42);
    backdropScript.addKeyframe({fr: 0xa1, fg: 0xb5, fb: 0xd7, tr: 0, rg: 0, tb: 0, rot: -Math.PI - Math.PI/2},70);
    backdropScript.addKeyframe({fr: 0xff, fg: 0x00, fb: 0x80, tr: 0x80, rg: 0, tb: 0xff, rot: -3 *Math.PI/4},100);
    backdropScript.addKeyframe({fr: 0xff, fg: 0x00, fb: 0x80, tr: 0x80, rg: 0, tb: 0xff, rot: -3 *Math.PI/4},125);
    backdropScript.addKeyframe({fr: 0, fg: 0, fb: 0, tr: 0, rg: 0, tb: 0, rot: -3 *Math.PI/4},130);
    backdropScript.addKeyframe({fr: 0, fg: 0, fb: 0, tr: 0, rg: 0, tb: 0, rot: -3 *Math.PI/4},200);
    this.backdropScript = backdropScript;

  }

  getValues(script,t)
  {
    var v = {};
    script.updateValues(t, v);
    return v;
  }
}