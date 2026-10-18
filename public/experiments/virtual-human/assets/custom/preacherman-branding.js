(function () {
  window.PreachermanBranding = {
    async attach(character) {
      const response = await fetch('assets/custom/chest-track.json');
      if (!response.ok) throw new Error('Chest logo tracking could not be loaded.');
      const track = await response.json();
      const center = new Vector3(), right = new Vector3(), up = new Vector3(), front = new Vector3();
      const shader = character.mesh.shader;
      shader.addUniforms({
        tChestLogo: {value:Utils3D.getTexture('assets/custom/preacherman-logo.png')},
        uChestCenter: {value:center}, uChestRight: {value:right},
        uChestUp: {value:up}, uChestFront: {value:front}
      });
      const video = character.videoTexture.video;
      const source = video.video || video.element?.div;
      if (!(source instanceof HTMLVideoElement)) throw new Error('Chest logo video clock is unavailable.');
      const vectors = [center,right,up,front], count = track.frames.length / track.stride;
      function update() {
        const frame = Math.min(count-1,Math.max(0,source.currentTime*track.fps));
        const first = Math.floor(frame), next = Math.min(first+1,count-1), alpha = frame-first;
        for (let vector=0;vector<4;vector++) {
          const a=first*12+vector*3, b=next*12+vector*3;
          vectors[vector].set(...[0,1,2].map(i=>track.frames[a+i]*(1-alpha)+track.frames[b+i]*alpha));
          if (vector) vectors[vector].normalize();
        }
      }
      update();
      character.startRender(update);
      window.__preachermanChest = {update,source,center,right,up,front,frames:count};
    }
  };
})();
