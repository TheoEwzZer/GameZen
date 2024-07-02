<div align="center">
<h1 align="center">
<img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
<br>GameZen
</h1>
<h3>◦ Play uninterrupted with GameZen!</h3>
<h3>◦ A BetterDiscord plugin</h3>
<h3>◦ Developed with the language listed below.</h3>

<p align="center">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style&logo=JavaScript&logoColor=black" alt="JavaScript" />
</p>
<img src="https://img.shields.io/github/languages/top/TheoEwzZer/GameZen?style&color=5D6D7E" alt="GitHub top language" />
<img src="https://img.shields.io/github/languages/code-size/TheoEwzZer/GameZen?style&color=5D6D7E" alt="GitHub code size in bytes" />
<img src="https://img.shields.io/github/commit-activity/m/TheoEwzZer/GameZen?style&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/license/TheoEwzZer/GameZen?style&color=5D6D7E" alt="GitHub license" />
</div>

---

## 📒 Table of Contents

- [📒 Table of Contents](#-table-of-contents)
- [📍 Overview](#-overview)
- [⚙️ Features](#️-features)
- [🧩 Modules](#-modules)
- [🚀 Getting Started](#-getting-started)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📍 Overview

The GameZen plugin is a BetterDiscord plugin that aims to enhance the user experience by automatically activating Do Not Disturb mode and updating the user status when any game is launched. By providing a settings panel, users are able to customize the check interval, making it a flexible and personalized solution for gamers on Discord. Its core value proposition lies in its ability to enhance productivity and immersion during gaming sessions by managing notifications effectively.

---

## ⚙️ Features

| Feature                | Description                                                                                                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **⚙️ Architecture**    | The system follows a plugin design pattern, where the GameZen plugin integrates with Discord. It uses event-driven programming to detect game launches and update the user status. The settings panel provides customization options. The codebase is organized into functions and classes. |
| **🔗 Dependencies**    | The codebase heavily relies on the Discord.js library for interacting with the Discord API. There don't seem to be any other external dependencies.                                                                                                                                         |
| **🧩 Modularity**      | The codebase is modular, with the functionality divided into separate files. The main functionality is contained within the GameZen.plugin.js file, and the settings panel implementation is in progress.                                                                                   |
| **⚡️ Performance**    | Performance assessment cannot be made from the codebase alone. It depends on how well the Discord.js library handles interactions with the Discord API.                                                                                                                                     |
| **🔀 Version Control** | The codebase utilizes Git for version control. The commit history suggests collaborative development and branches for feature implementation.                                                                                                                                               |
| **🔌 Integrations**    | The system integrates with BetterDiscord, utilizing the Discord.js library to interact with the Discord API and modify user status based on launched games.                                                                                                                                 |
| **📶 Scalability**     | Scalability considerations cannot be determined from the codebase. Dependencies on external systems may affect scalability aspects. However, as a plugin, it should integrate well with the existing Discord infrastructure and scale accordingly.                                          |

---

## 🧩 Modules

<details closed><summary>Root</summary>

| File                                                                                   | Summary                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GameZen.plugin.js](https://github.com/TheoEwzZer/GameZen/blob/main/GameZen.plugin.js) | The code is for a BetterDiscord plugin called GameZen. It automatically activates Do Not Disturb mode when a game is launched, and updates the user status accordingly. It also provides a settings panel for customizing the check interval. |

</details>

---

## 🚀 Getting Started

### ✔️ Prerequisites

Make sure you have **BetterDiscord** installed. If not, you can download it from the official website: [BetterDiscord](https://betterdiscord.app).

### 📦 Installation

1. Download the GameZen plugin file from the [GitHub repository](https://github.com/TheoEwzZer/GameZen).
2. In Discord, go to your BetterDiscord settings and select the Plugins tab.
3. At the top click the Open Plugins Folder button.
4. Drag and drop, or move, the plugin you downloaded into this folder.
5. Go back to your Plugins pages and enable your plugin.

### 🎮 Using GameZen

Once the plugin is installed and Discord is running, GameZen will automatically activate `Do Not Disturb` mode when a game is launched. When you close the game, it will restore your previous status.

---

## 🤝 Contributing

Contributions are always welcome! Please follow these steps:

1. Fork the project repository. This creates a copy of the project on your account that you can modify without affecting the original project.
2. Clone the forked repository to your local machine using a Git client like Git or GitHub Desktop.
3. Create a new branch with a descriptive name (e.g., `new-feature-branch` or `bugfix-issue-123`).

```sh
git checkout -b new-feature-branch
```

4. Make changes to the project's codebase.
5. Commit your changes to your local branch with a clear commit message that explains the changes you've made.

```sh
git commit -m 'Implemented new feature.'
```

6. Push your changes to your forked repository on GitHub using the following command

```sh
git push origin new-feature-branch
```

7. Create a new pull request to the original project repository. In the pull request, describe the changes you've made and why they're necessary.
   The project maintainers will review your changes and provide feedback or merge them into the main branch.

---

## 📄 License

This plugin is licensed under the `MIT` License. See the [LICENSE](https://github.com/TheoEwzZer/GameZen/blob/main/LICENSE) file for additional info.

---
