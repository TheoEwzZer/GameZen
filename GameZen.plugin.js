/**
 * @name GameZen
 * @author Théo EwzZer
 * @authorId 384009727253807105
 * @authorLink https://github.com/TheoEwzZer
 * @description Automatically activates Do Not Disturb mode when a game is launched.
 * @donate https://www.paypal.me/TheoEwzZer
 * @source https://github.com/TheoEwzZer/GameZen
 * @updateUrl https://raw.githubusercontent.com/TheoEwzZer/GameZen/main/GameZen.plugin.js
 * @version 0.2.0
 */

/**
 * The module for accessing user settings.
 * @typedef {Object} UserSettingsProtoStore
 * @property {Object} settings - The user settings object.
 */
const UserSettingsProtoStore = BdApi.Webpack.getModule(
  (m) =>
    m && typeof m.getName == "function" && m.getName() == "UserSettingsProtoStore" && m,
  { first: true, searchExports: true }
);

/**
 * Utility functions for updating user settings.
 * @typedef {Object} UserSettingsProtoUtils
 * @property {Function} updateAsync - Asynchronously updates a user setting.
 */
const UserSettingsProtoUtils = BdApi.Webpack.getModule(
  (m) => m?.ProtoClass?.typeName?.endsWith(".PreloadedUserSettings"),
  { first: true, searchExports: true }
);

const ERRORS = {
  ERROR_UPDATING_USER_STATUS: "Error updating user status:",
  ERROR_STARTING_GAMEZEN: "Error starting GameZen:",
  ERROR_STOPPING_GAMEZEN: "Error stopping GameZen:",
  ERROR_GETTING_CURRENT_USER_STATUS: "Error getting current user status:",
  ERROR_UPDATING_USER_STATUS_TO_CURRENT_STATUS:
    "Error updating user status to current status:",
  ERROR_UPDATING_USER_STATUS_TO_DND: "Error updating user status to DND:",
};

module.exports = class GameZen {
  /**
   * Constructor for the GameZen class.
   */
  constructor(meta) {
    this.meta = meta;
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
   * Observes changes in activity and updates the status accordingly.
   */
  observePresenceChanges() {
    const LocalActivityStore = BdApi.Webpack.getStore("LocalActivityStore");

    if (!LocalActivityStore) {
      console.error("LocalActivityStore not found.");
      return;
    }

    const checkActivity = () => {
      const primaryActivity = LocalActivityStore.getPrimaryActivity();

      if (primaryActivity) {
        this.updateToDnd();
      } else if (this.currentStatus() === "dnd") {
        this.updateToCurrentStatus();
      }
    };

    checkActivity();

    this.unsubscribe = LocalActivityStore.addChangeListener(checkActivity);
  }

  /**
   * Activates Do Not Disturb mode when a game is launched.
   */
  start() {
    try {
      this.currentUserStatus = this.currentStatus();
      this.observePresenceChanges();
    } catch (error) {
      console.error(ERRORS.ERROR_STARTING_GAMEZEN, error);
    }
  }

  /**
   * Stops the GameZen plugin by removing the activity change listener and updating the user status to the current status.
   */
  stop() {
    try {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.updateToCurrentStatus();
    } catch (error) {
      console.error(ERRORS.ERROR_STOPPING_GAMEZEN, error);
    }
  }
};
