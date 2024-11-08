# Jstz setup

> Official setup page here : [jstz installation](https://jstz-dev.github.io/jstz/installation.html)

Let's suppose we are running on Windows / WSL2 Ubuntu

1. Once Docker is installed, install the Jstz CLI

    ```bash
    source <(curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/jstz-dev/jstz/main/scripts/install-jstz-cli.sh)

    jstz --version
    ```

1. (Optional) If your docker image is too old, override the jstz alias to have a more recent docker image like **20241007**

    ```bash
    alias jstz='docker run --rm -v "/tmp:/tmp" -v "$HOME/.jstz:/root/.jstz" -v "$PWD:$PWD" -w "$PWD" --network host -it ghcr.io/jstz-dev/jstz/jstz-cli:20241007'
    ```

1. Install a recent version of npm (10.9.0) and node (v18.19.1)

