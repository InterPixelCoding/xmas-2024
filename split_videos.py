import subprocess
import os

def get_video_frame_rate(video_path):
    """Retrieve the frame rate of the video using ffprobe."""
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=r_frame_rate",
            "-of", "default=noprint_wrappers=1:nokey=1",
            video_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    frame_rate_str = result.stdout.strip()
    if "/" in frame_rate_str:
        num, denom = map(int, frame_rate_str.split("/"))
        return num / denom
    return float(frame_rate_str)

def split_video(video_path, frame_numbers):
    """Split the video into smaller segments based on the provided frame numbers."""
    frame_rate = get_video_frame_rate(video_path)
    timestamps = [frame / frame_rate for frame in frame_numbers]

    extracts_dir = "extracts"
    reversed_dir = "reversed_extracts"
    os.makedirs(extracts_dir, exist_ok=True)
    os.makedirs(reversed_dir, exist_ok=True)

    file_extension = os.path.splitext(video_path)[1]

    prev_timestamp = 0
    for i, timestamp in enumerate(timestamps):
        output_file = os.path.join(extracts_dir, f"segment_{i + 1}{file_extension}")
        reversed_file = os.path.join(reversed_dir, f"segment_{i + 1}_reversed{file_extension}")
        duration = timestamp - prev_timestamp

        # Create the normal segment
        subprocess.run([
            "ffmpeg",
            "-i", video_path,
            "-ss", str(prev_timestamp),
            "-t", str(duration),
            "-c", "copy",
            output_file
        ])

        # Create the reversed segment, preserving transparency
        subprocess.run([
            "ffmpeg",
            "-i", output_file,
            "-vf", "reverse",  # Reverse video
            "-af", "areverse",  # Reverse audio
            "-vcodec", "vp9",  # Use VP9 codec for WebM format (preserves transparency)
            "-acodec", "libopus",  # Use Opus codec for audio
            "-c:a", "copy",  # Copy audio codec settings
            reversed_file
        ])

        prev_timestamp = timestamp

    # Final segment
    output_file = os.path.join(extracts_dir, f"segment_{len(timestamps) + 1}{file_extension}")
    reversed_file = os.path.join(reversed_dir, f"segment_{len(timestamps) + 1}_reversed{file_extension}")
    subprocess.run([
        "ffmpeg",
        "-i", video_path,
        "-ss", str(prev_timestamp),
        "-c", "copy",
        output_file
    ])
    subprocess.run([
        "ffmpeg",
        "-i", output_file,
        "-vf", "reverse",  # Reverse video
        "-af", "areverse",  # Reverse audio
        "-vcodec", "vp9",  # Use VP9 codec for WebM format (preserves transparency)
        "-acodec", "libopus",  # Use Opus codec for audio
        "-c:a", "copy",  # Copy audio codec settings
        reversed_file
    ])

    print(f"Video segments saved in '{extracts_dir}' and reversed segments saved in '{reversed_dir}'")

def main():
    video_path = input("Enter the path to the video file: ").strip()
    frame_numbers = input(
        "Enter the frame numbers to cut the video at (comma-separated): "
    ).strip()

    try:
        frame_numbers = [int(frame.strip()) for frame in frame_numbers.split(",")]
        split_video(video_path, frame_numbers)
    except ValueError:
        print("Invalid frame numbers. Please enter integers separated by commas.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
