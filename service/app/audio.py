from __future__ import annotations

import pathlib
import subprocess


class AudioError(RuntimeError):
    pass


def ffmpeg_to_ogg(src: pathlib.Path, dst: pathlib.Path) -> None:
    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        "-c:a", "libopus", "-b:a", "32k", "-vbr", "on", "-compression_level", "10",
        str(dst),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise AudioError("ffmpeg conversion failed:\n" + result.stdout[-1200:] + "\n" + result.stderr[-1200:])
