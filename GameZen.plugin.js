/**
 * @name GameZen
 * @author Théo EwzZer
 * @authorLink https://github.com/TheoEwzZer
 * @description Automatically activates Do Not Disturb mode when Valorant is launched.
 * @version 0.0.1
 */

/**
 * The module for accessing user settings.
 * @typedef {Object} UserSettingsProtoStore
 * @property {Object} settings - The user settings object.
 */
const UserSettingsProtoStore = BdApi.Webpack.getModule(
  (m) =>
    m &&
    typeof m.getName == "function" &&
    m.getName() == "UserSettingsProtoStore" &&
    m,
  { first: true, searchExports: true }
);

/**
 * Utility functions for updating user settings.
 * @typedef {Object} UserSettingsProtoUtils
 * @property {Function} updateAsync - Asynchronously updates a user setting.
 */
const UserSettingsProtoUtils = BdApi.Webpack.getModule(
  (m) =>
    m.ProtoClass && m.ProtoClass.typeName.endsWith(".PreloadedUserSettings"),
  { first: true, searchExports: true }
);

const Settings = { gameName: "VALORANT" };

module.exports = class GameZen {
  /**
   * Constructor for the GameZen class.
   */
  constructor(meta) {
    this.meta = meta;
    this.found = false;
  }

  /**
   * Updates the remote status to the param `toStatus`
   * @param {('online'|'idle'|'invisible'|'dnd')} toStatus
   */
  updateStatus(toStatus) {
    UserSettingsProtoUtils.updateAsync(
      "status",
      (statusSetting) => {
        statusSetting.status.value = toStatus;
      },
      0
    );
  }

  /**
   * @returns {string} the current user status
   */
  currentStatus() {
    return UserSettingsProtoStore.settings.status.status.value;
  }

  /**
   * Activates Do Not Disturb mode when Valorant is launched.
   */
  start() {
    Object.assign(Settings, BdApi.loadData(this.meta.name, "settings"));
    this.currentUserStatus = this.currentStatus();
    this.getLocalPresence =
      BdApi.findModuleByProps("getLocalPresence").getLocalPresence;

    this.intervalId = setInterval(() => {
      for (const x in this.getLocalPresence().activities) {
        if (this.getLocalPresence().activities[x].name === Settings.gameName) {
          this.updateStatus("dnd");
          this.found = true;
        }
      }
      if (!this.found) {
        this.updateStatus(this.currentUserStatus);
      }
      this.found = false;
    }, 10000);
  }

  stop() {
    clearInterval(this.intervalId);
    this.updateStatus(this.currentStatus());
  }

  buildSetting(text, key, type, value, callback = () => {}) {
    const setting = Object.assign(document.createElement("div"), {
      className: "setting",
    });
    const label = Object.assign(document.createElement("span"), {
      textContent: text,
    });
    const input = Object.assign(document.createElement("input"), {
      type: type,
      name: key,
      value: value,
    });
    input.addEventListener("change", () => {
      const newValue = input.value;
      Settings[key] = newValue;
      BdApi.saveData(this.meta.name, "settings", Settings);
      callback(newValue);
    });
    setting.append(label, input);
    return setting;
  }

  getSettingsPanel() {
    const SettingsPanel = document.createElement("div");
    SettingsPanel.id = "settings";

    const gameName = this.buildSetting(
      "Game Name",
      "gameName",
      "text",
      Settings.gameName,
      this.updateButtonText
    );
    SettingsPanel.append(gameName);
    return SettingsPanel;
  }
};
