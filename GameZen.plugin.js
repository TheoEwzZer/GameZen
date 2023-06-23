/**
 * @name GameZen
 * @author Théo EwzZer
 * @authorId 384009727253807105
 * @authorLink https://github.com/TheoEwzZer
 * @description Automatically activates Do Not Disturb mode when a game is launched.
 * @donate https://www.paypal.me/TheoEwzZer
 * @source https://github.com/TheoEwzZer/GameZen
 * @updateUrl https://raw.githubusercontent.com/TheoEwzZer/GameZen/main/GameZen.plugin.js
 * @version 0.0.2
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

const ERRORS = {
  INVALID_GAME_NAME: "Invalid game name:",
  ERROR_UPDATING_USER_STATUS: "Error updating user status:",
  ERROR_STARTING_GAMEZEN: "Error starting GameZen:",
  ERROR_STOPPING_GAMEZEN: "Error stopping GameZen:",
  ERROR_SAVING_SETTINGS: "Error saving settings:",
  ERROR_GETTING_CURRENT_USER_STATUS: "Error getting current user status:",
  ERROR_UPDATING_USER_STATUS_TO_CURRENT_STATUS:
    "Error updating user status to current status:",
  ERROR_UPDATING_USER_STATUS_TO_DND: "Error updating user status to DND:",
};

const SETTINGS = { gameName: "Game Name" };

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
    try {
      UserSettingsProtoUtils.updateAsync(
        "status",
        (statusSetting) => {
          statusSetting.status.value = toStatus;
        },
        0
      );
    } catch (error) {
      console.error(ERRORS.ERROR_UPDATING_USER_STATUS, error);
    }
  }

  /**
   * @returns {string} the current user status
   */
  currentStatus() {
    try {
      return UserSettingsProtoStore.settings.status.status.value;
    } catch (error) {
      console.error(ERRORS.ERROR_GETTING_CURRENT_USER_STATUS, error);
      return "";
    }
  }

  /**
   * Checks if the user is currently playing the game specified in the `SETTINGS.gameName` property.
   * @param {Array} activities - An array of user activities.
   * @returns {boolean} - Returns `true` if the user is playing the game specified in `SETTINGS.gameName`, otherwise returns `false`.
   */
  isGameActivity(activities) {
    if (
      typeof SETTINGS.gameName !== "string" ||
      SETTINGS.gameName.trim() === ""
    ) {
      console.error(ERRORS.INVALID_GAME_NAME, SETTINGS.gameName);
      return false;
    }
    for (const activity in activities) {
      if (activities[activity].name === SETTINGS.gameName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Updates the user status to "dnd".
   */
  updateToDnd() {
    try {
      if (this.currentStatus() !== "dnd") {
        this.currentUserStatus = this.currentStatus();
        this.updateStatus("dnd");
      }
    } catch (error) {
      console.error(ERRORS.ERROR_UPDATING_USER_STATUS_TO_DND, error);
    }
  }

  /**
   * Updates the user status to the current status.
   */
  updateToCurrentStatus() {
    try {
      this.updateStatus(this.currentUserStatus);
    } catch (error) {
      console.error(ERRORS.ERROR_UPDATING_USER_STATUS_TO_CURRENT_STATUS, error);
    }
  }

  /**
   * Activates Do Not Disturb mode when a game is launched.
   */
  start() {
    Object.assign(SETTINGS, BdApi.loadData(this.meta.name, "settings"));
    this.currentUserStatus = this.currentStatus();
    this.getLocalPresence =
      BdApi.findModuleByProps("getLocalPresence").getLocalPresence;

    this.intervalId = setInterval(() => {
      for (const x in this.getLocalPresence().activities) {
        if (this.getLocalPresence().activities[x].name === SETTINGS.gameName) {
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

  /**
   * Stops the GameZen plugin by clearing the interval and updating the user status to the current status.
   */
  stop() {
    clearInterval(this.intervalId);
    this.updateStatus(this.currentStatus());
  }

  /**
   * Builds a setting element.
   * @param {string} text
   * @param {string} key
   * @param {string} type
   * @param {string} value
   * @param {Function} callback
   * @returns {HTMLElement} the setting element
   */
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
    const changeListener = () => {
      const newValue = input.value;
      SETTINGS[key] = newValue;
      try {
        BdApi.saveData(this.meta.name, "settings", SETTINGS);
      } catch (error) {
        console.error(ERRORS.ERROR_SAVING_SETTINGS, error);
      }
      callback(newValue);
    };
    input.addEventListener("change", changeListener);
    setting.append(label, input);
    setting.destroy = () => {
      input.removeEventListener("change", changeListener);
    };
    return setting;
  }

  /**
   * Builds the settings panel.
   * @returns {HTMLElement} the settings panel
   */
  getSettingsPanel() {
    const SettingsPanel = document.createElement("div");
    SettingsPanel.id = "settings";

    const gameName = this.buildSetting(
      "Game Name",
      "gameName",
      "text",
      SETTINGS.gameName,
      this.updateButtonText
    );
    SettingsPanel.append(gameName);
    return SettingsPanel;
  }
};
