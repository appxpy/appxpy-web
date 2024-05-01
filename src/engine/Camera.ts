import { Engine } from './Engine'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GameEntity } from './GameEntity'

export type sizes = {
  width:  number,
  height: number
}

export class Camera implements GameEntity {
  public instance!: THREE.OrthographicCamera
  private controls!: OrbitControls

  constructor(private engine: Engine) {
    this.initCamera()
    this.initControls()
  }

  private initCamera() {
    // this.instance = new THREE.PerspectiveCamera(
    //   // 2 * Math.atan(this.engine.sizes.height / (2 * 5)) * (180 / Math.PI),
    //   75,
    //   this.engine.sizes.width / this.engine.sizes.height,
    //   0.1,
    //   10000
    // )
    this.instance = new THREE.OrthographicCamera();
    this.engine.scene.add(this.instance)
  }

  private initControls() {
    this.controls = new OrbitControls(this.instance, this.engine.canvas)
    this.controls.update()
  }

  resize() {
    // this.instance.aspect = this.engine.sizes.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
