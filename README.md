# Mohamed Abdelwahab — Robotics Portfolio

Static portfolio website for projects, demonstrations, publications, and robotics articles.

## Preview locally

Run the included range-enabled server so large MP4 files can seek immediately without waiting for the complete download:

```bash
chmod +x serve.sh
./serve.sh
```

Open:

```text
http://127.0.0.1:8000
```

The server supports HTTP byte-range requests (`206 Partial Content`), which are required for responsive forward and backward seeking in long videos.

## Adaptive robust control project

The project page is available at:

```text
projects/adaptive-robust-control.html
```

It contains:

- the complete explanation video at the top;
- figures extracted from the explanation video;
- the feedback-linearization problem formulation;
- the Lyapunov-based adaptive gain mechanism;
- the boundary-layer robust law;
- the convergence interpretation;
- known-bound and Gaussian-Process evaluation scenarios;
- the publication PDF and BibTeX citation.

## Demo videos

```text
assets/videos/main_research_demo.mp4
assets/videos/franka_pmcpilco_preview.mp4
assets/videos/uvms_planning_preview.mp4
assets/videos/adaptive_control_preview.mp4
assets/videos/adaptive_robust_control_paper_scene.mp4
assets/videos/gp_robust_control_preview.mp4
```

