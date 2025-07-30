"use client"

import { useEffect, useRef, useState } from 'react'
import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Texture,
  WebXRDefaultExperience,
  WebXRState,
} from 'babylonjs'
import 'babylonjs-loaders'

export default function ExploreVRPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const xrHelperRef = useRef<WebXRDefaultExperience | null>(null)
  const [supported, setSupported] = useState(false)
  const [inVr, setInVr] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new Engine(canvas, true)
    const scene = new Scene(engine)

    const camera = new FreeCamera('camera', new Vector3(0, 1.6, 0), scene)
    camera.inputs.clear()
    camera.setTarget(new Vector3(0, 1.6, 1))

    new HemisphericLight('light', new Vector3(0, 1, 0), scene)

    const radius = 4
    const images = Array.from({ length: 10 }, (_, i) => `https://picsum.photos/seed/vr${i}/1024/768`)
    images.forEach((url, idx) => {
      const angle = (idx / images.length) * Math.PI * 2
      const plane = MeshBuilder.CreatePlane(`img-${idx}`, { width: 1.5, height: 1 }, scene)
      plane.position = new Vector3(radius * Math.sin(angle), 1.6, radius * Math.cos(angle))
      plane.rotation.y = -angle + Math.PI
      const mat = new StandardMaterial(`mat-${idx}`, scene)
      mat.diffuseTexture = new Texture(url, scene)
      plane.material = mat
    })

    if (navigator.xr) {
      setSupported(true)
      WebXRDefaultExperience.CreateAsync(scene, {
        disableTeleportation: true,
        disableDefaultUI: true,
      }).then((helper) => {
        xrHelperRef.current = helper
        helper.baseExperience.onStateChangedObservable.add((state) => {
          setInVr(state === WebXRState.IN_XR)
        })
      })
    }

    engine.runRenderLoop(() => scene.render())
    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose()
    }
  }, [])

  const enterVR = () => {
    xrHelperRef.current?.baseExperience.enterXRAsync('immersive-vr', 'local-floor')
  }

  return (
    <div className="w-screen h-screen bg-black relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      {supported ? (
        !inVr && (
          <button
            onClick={enterVR}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded"
          >
            👓 Enter VR Mode
          </button>
        )
      ) : (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
          VR mode is not supported on this device.
        </div>
      )}
    </div>
  )
}

