(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const rounded = Math.floor(seconds);
    const minutes = Math.floor(rounded / 60);
    const remaining = String(rounded % 60).padStart(2, '0');
    return `${minutes}:${remaining}`;
  };

  const videos = [...document.querySelectorAll('video[data-seekable-video], video[data-demo-video], video[data-project-video]')];

  videos.forEach((video) => {
    video.controls = true;
    video.preload = 'metadata';
    video.setAttribute('playsinline', '');
    video.setAttribute('tabindex', '0');

    const shell = video.closest('.video-shell');
    const fallback = shell?.querySelector('.video-unavailable');
    const showFallback = () => fallback?.classList.add('visible');
    const hideFallback = () => fallback?.classList.remove('visible');

    video.addEventListener('loadedmetadata', hideFallback);
    video.addEventListener('canplay', hideFallback);
    video.addEventListener('error', showFallback);

    const source = video.querySelector('source');
    if (!source || !source.getAttribute('src')) showFallback();

    video.addEventListener('play', () => {
      videos.forEach((other) => {
        if (other !== video && !other.paused) other.pause();
      });
    });

    if (shell && !shell.nextElementSibling?.classList.contains('video-seek-controls')) {
      const controls = document.createElement('div');
      controls.className = 'video-seek-controls';
      controls.setAttribute('aria-label', 'Video navigation controls');

      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'video-seek-button';
      back.dataset.skip = '-10';
      back.setAttribute('aria-label', 'Go back 10 seconds');
      back.textContent = '↶ 10 s';

      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'video-seek-button video-play-toggle';
      play.setAttribute('aria-label', 'Play video');
      play.textContent = 'Play';

      const forward = document.createElement('button');
      forward.type = 'button';
      forward.className = 'video-seek-button';
      forward.dataset.skip = '10';
      forward.setAttribute('aria-label', 'Go forward 10 seconds');
      forward.textContent = '10 s ↷';

      const time = document.createElement('span');
      time.className = 'video-time-readout';
      time.textContent = '0:00 / 0:00';
      time.setAttribute('aria-live', 'polite');

      controls.append(back, play, forward, time);
      shell.insertAdjacentElement('afterend', controls);

      const seekBy = (delta) => {
        const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
        video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), duration);
      };

      controls.querySelectorAll('[data-skip]').forEach((button) => {
        button.addEventListener('click', () => seekBy(Number(button.dataset.skip)));
      });

      play.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
      });

      const updatePlayState = () => {
        const paused = video.paused;
        play.textContent = paused ? 'Play' : 'Pause';
        play.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
      };

      const updateTime = () => {
        time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      };

      video.addEventListener('loadedmetadata', updateTime);
      video.addEventListener('durationchange', updateTime);
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('play', updatePlayState);
      video.addEventListener('pause', updatePlayState);
      video.addEventListener('ended', updatePlayState);
      updatePlayState();

      video.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          seekBy(-10);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          seekBy(10);
        } else if (event.key === ' ' || event.key === 'k') {
          event.preventDefault();
          if (video.paused) video.play();
          else video.pause();
        }
      });
    }
  });


  const localVideos = [...document.querySelectorAll('video[data-seekable-video], video[data-demo-video], video[data-project-video]')];
  document.querySelectorAll('.youtube-facade[data-youtube-id]').forEach((button) => {
    button.addEventListener('click', () => {
      localVideos.forEach((video) => {
        if (!video.paused) video.pause();
      });

      const videoId = button.dataset.youtubeId;
      const title = button.dataset.youtubeTitle || 'YouTube video';
      if (!videoId) return;

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.loading = 'eager';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('allowfullscreen', '');
      button.replaceWith(iframe);
    });
  });

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        const old = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = old; }, 1400);
      } catch (_) {
        button.textContent = 'Select and copy';
      }
    });
  });
})();
