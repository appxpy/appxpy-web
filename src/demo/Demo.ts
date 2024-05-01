import { Engine } from '../engine/Engine'
import * as THREE from 'three'
import fragment from './shader.frag';
import vertex from './shader.vert';
import { Experience } from '../engine/Experience'
import { Resource } from '../engine/Resources'


export class Demo implements Experience {
  resources: Resource[] = []
  private plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap> | undefined

  constructor(private engine: Engine) {}

  init() {
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.engine.sizes.width, this.engine.sizes.height),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: {value: this.engine.time.currentTime},
          iResolution: {value: new THREE.Vector2(this.engine.sizes.width, this.engine.sizes.height)},
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
    }),
    )

    // plane.rotation.x = 0
    this.plane.receiveShadow = true
    this.plane.position.set(0, 0, 0)
    this.engine.camera.instance.position.set(0,0,5)
    this.engine.scene.add(this.plane)
    this.engine.scene.add(new THREE.AmbientLight(0xffffff, 10))
  }

  resize() {
    if (!this.plane) {
      return
    }
    this.plane.material.uniforms.iResolution.value = new THREE.Vector2(this.engine.sizes.width, this.engine.sizes.height);
  }

  update() {
    if (!this.plane) {
      return
    }
    let time = new Date().getTime() / 1000;
    this.plane.material.uniforms.uTime.value = time % 86400;
  }
}
