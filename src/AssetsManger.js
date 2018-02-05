const PIXI = require('pixi.js')
const PixiSound = require('pixi-sound')


export default class AssetsManger {
  constructor() {
    this.loader = new PIXI.loaders.Loader();
    this.onComplete = null;

    //sound
    const soundList = {
      bg1: 'assets/80sxmasexperiments3.mp3',
      bg2: 'assets/bg2.mp3'
    };
    for (let name in soundList) {
      this.loader.add(name, soundList[name]);
    }

  }
  start() {
    this.loader.once('complete', this.onComplete);
    this.loader.on('progress', this.onProgress);
    this.loader.load();


  }
  // onComplete(e)
  // {
  //   console.log(e);
  //   console.log(e.resources["bg1"]);
  // }


  onProgress(e) {
    console.log("加载百分比" + e.progress + "%");
  }
}