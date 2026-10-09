/* One optical projection shared by the compositor and pointer raycasting. */
(() => {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    centerZoom: 0.62,
    horizonCurve: 0.34,
    ellipseX: 0.95,
    ellipseY: 1.14,
    edgeStart: 0.26,
    edgeEnd: 1.28,
    beamSpreadX: 0.18,
    beamSpreadZ: 0.14
  }/*EDITMODE-END*/;
  const smooth = (a,b,x) => {const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  const lens = {
    amount: 0, zoom: 1, defaults: TWEAK_DEFAULTS,
    update(scene, dt) {
      const phase=document.documentElement.dataset.sceneStage;
      // Reverse the camera, not the lens: the planet stays curved for the
      // entire return. Reset only once the intro has replaced the world.
      const target=phase==='scene'||phase==='entering'||phase==='leaving'?1:0;
      const step=Math.min(0.1,Math.max(0,dt>1?dt/1000:dt));
      if(phase==='intro')this.amount=0;
      else this.amount += (target-this.amount)*(1-Math.exp(-step*3.2));
      if(Math.abs(this.amount-target)<0.0005)this.amount=target;
      const base=scene._designFov*scene._fovFactor;
      const zoom=1+(TWEAK_DEFAULTS.centerZoom-1)*this.amount;
      const fov=Math.min(128,2*Math.atan(Math.tan(base*Math.PI/360)/zoom)*180/Math.PI);
      this.zoom=Math.tan(base*Math.PI/360)/Math.tan(fov*Math.PI/360);
      if(Math.abs(scene.camera.fov-fov)>0.00001){scene.camera.fov=fov;scene.camera.updateProjectionMatrix();}
      const uniforms=scene.renderManager.compositeMaterial.uniforms;
      uniforms.uPlanetLens.value.set(this.amount,this.zoom,TWEAK_DEFAULTS.horizonCurve,0);
      uniforms.uPlanetProfile.value.set(TWEAK_DEFAULTS.ellipseX,TWEAK_DEFAULTS.ellipseY,TWEAK_DEFAULTS.edgeStart,TWEAK_DEFAULTS.edgeEnd);
    },
    toScene(x,y) {
      const d=TWEAK_DEFAULTS;
      const radius=Math.hypot(x*d.ellipseX,y*d.ellipseY);
      const scale=this.zoom+(1-this.zoom)*smooth(d.edgeStart,d.edgeEnd,radius);
      const sx=x*scale,sy=y*scale;
      return {x:sx,y:sy+this.amount*d.horizonCurve*x*x*(1-sy*sy)};
    },
    unprojectPointer(point) {
      point._displayX=point.x;point._displayY=point.y;
      const p=this.toScene(point.x,point.y);point.x=p.x;point.y=p.y;
    },
    syncBeams(marker,camera) {
      const u=marker.material.uniforms;
      const main=camera===marker.gl.camera;
      u.uBeamCompensate.value=main?1:0;
      if(!main)return; // Keep the original world-space water reflection.
      u.uBeamOptics.value.set(this.amount,this.zoom,this.defaults.horizonCurve,0);
      const d=this.defaults;
      u.uBeamProfile.value.set(d.ellipseX,d.ellipseY,d.edgeStart,d.edgeEnd);
      camera.updateMatrixWorld();
      const plane=u.uWaterPlane.value;
      for(const item of marker._items){
        const hit=item.hitSphere;if(!hit)continue;
        const anchor=hit.getWorldPosition(hit.userData._beamAnchor??=hit.position.clone());
        const axis=(hit.userData._beamAxis??=hit.position.clone()).set(0,1,0).transformDirection(hit.matrixWorld);
        const distance=plane.x*anchor.x+plane.y*anchor.y+plane.z*anchor.z+plane.w;
        anchor.addScaledVector(axis,-distance/(plane.x*axis.x+plane.y*axis.y+plane.z*axis.z));
        anchor.project(camera);
        const display=this.toDisplay(anchor.x,anchor.y),h=.0001;
        const p=this.toScene(display.x,display.y);
        const px=this.toScene(display.x+h,display.y),py=this.toScene(display.x,display.y+h);
        const ax=(px.x-p.x)/h,ay=(px.y-p.y)/h,bx=(py.x-p.x)/h,by=(py.y-p.y)/h;
        const det=ax*by-ay*bx;
        const jac=u.uBeamJacobians.value[item.index];
        jac.set(by/det,-bx/det,-ay/det,ax/det);
        const origin=u.uBeamAnchors.value[item.index];
        origin.set(anchor.x,anchor.y,display.x,display.y);
        hit.userData.beamProjection={origin,jac};
      }
    },
    beamToDisplay(point,hit){
      const {origin:a,jac:j}=hit.userData.beamProjection;
      const x=point.x-a.x,y=point.y-a.y;
      return{x:a.z+j.x*x+j.y*y,y:a.w+j.z*x+j.w*y};
    },
    rayForTarget(manager,target){
      const mouse=manager.mouse;
      if(mouse._displayX===undefined)return;
      const x=mouse._displayX,y=mouse._displayY;
      const projection=target.userData.beamProjection;
      const point=manager._beamPointer??=mouse.clone();
      if(projection){
        const {origin:a,jac:j}=projection,dx=x-a.z,dy=y-a.w,det=j.x*j.w-j.y*j.z;
        point.set(a.x+(j.w*dx-j.y*dy)/det,a.y+(-j.z*dx+j.x*dy)/det);
      }else{const p=this.toScene(x,y);point.set(p.x,p.y);}
      manager.raycaster.setFromCamera(point,manager.camera);
    },
    toDisplay(x,y) {
      // Inverse lens for the water anchors and their local straight-ray basis.
      let px=x,py=y;
      for(let i=0;i<9;i++){
        const p=this.toScene(px,py),ex=p.x-x,ey=p.y-y;
        if(Math.abs(ex)+Math.abs(ey)<1e-7)break;
        const h=0.0001,a=this.toScene(px+h,py),b=this.toScene(px,py+h);
        const ax=(a.x-p.x)/h,ay=(a.y-p.y)/h,bx=(b.x-p.x)/h,by=(b.y-p.y)/h,det=ax*by-ay*bx;
        if(Math.abs(det)<1e-8)break;
        px-=(by*ex-bx*ey)/det;py-=(-ay*ex+ax*ey)/det;
      }
      return {x:px,y:py};
    }
  };
  window.__PREMAN_PLANET_LENS__=lens;
})();
