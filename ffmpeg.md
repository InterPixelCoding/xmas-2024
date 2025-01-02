ffmpeg -framerate 30 -i %04d.png -c:v libvpx-vp9 test.webm

ffmpeg -c:v libvpx-vp9 -i input.webm -f lavfi -i color=c=0x111413,format=rgb24 -filter_complex "[1][0]scale2ref[bg][vid];[bg][vid]overlay=format=rgb:shortest=1,setsar=1" -pix_fmt yuv420p -c:a copy 123.mp4