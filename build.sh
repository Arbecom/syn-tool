#!/bin/sh
# Builds the syn-tool Docker image.
# Uses --security-opt seccomp=unconfined because Synology's kernel does not
# support seccomp, which causes all RUN steps to fail with the default profile.
docker build --security-opt seccomp=unconfined -t syn-tool .
