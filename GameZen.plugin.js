/**
 * @name GameZen
 * @author Théo EwzZer
 * @description Automatically activates Do Not Disturb mode when a game is launched.
 * @version 1.1.2
 * @authorId 384009727253807105
 * @authorLink https://github.com/TheoEwzZer
 * @donate https://www.paypal.me/TheoEwzZer
 * @source https://github.com/TheoEwzZer/GameZen
 * @website https://www.theofabiano.com/
 * @updateUrl https://raw.githubusercontent.com/TheoEwzZer/GameZen/main/GameZen.plugin.js
 */

const gameZen = (meta) => {
  const { React, Webpack, Data } = BdApi;
  const { useState, useCallback } = React;

  // Lazy-loaded Webpack modules
  let UserSettingsProtoStore = null;
  let UserSettingsProtoUtils = null;

  // Plugin state
  let unsubscribe = null;
  let scheduledRecheck = null;
  let lastKnownRealStatus = null;
  let fakeStatusActivated = false;

  // Settings
  const defaultSettings = { ignoredGames: [] };
  let settings = {
    ...defaultSettings,
    ...Data.load(meta.name, "settings"),
  };

  // Styles
  const styles = {
    container: {
      padding: "16px",
      color: "var(--header-primary)",
    },
    title: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "16px",
      color: "var(--header-primary)",
    },
    subtitle: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      color: "var(--header-secondary)",
      marginBottom: "8px",
    },
    gameList: {
      listStyle: "none",
      padding: "0",
      margin: "0 0 16px 0",
    },
    gameItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      marginBottom: "4px",
      backgroundColor: "var(--background-secondary)",
      borderRadius: "4px",
    },
    gameName: {
      color: "var(--text-normal)",
      fontSize: "14px",
    },
    removeButton: {
      backgroundColor: "var(--button-danger-background)",
      color: "white",
      border: "none",
      borderRadius: "3px",
      padding: "4px 8px",
      fontSize: "12px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    inputContainer: {
      display: "flex",
      gap: "8px",
      marginTop: "12px",
    },
    input: {
      flex: "1",
      padding: "8px 12px",
      backgroundColor: "var(--input-background)",
      border: "none",
      borderRadius: "4px",
      color: "var(--text-normal)",
      fontSize: "14px",
      outline: "none",
    },
    addButton: {
      backgroundColor: "var(--button-positive-background)",
      color: "white",
      border: "none",
      borderRadius: "3px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    emptyState: {
      color: "var(--text-muted)",
      fontSize: "14px",
      fontStyle: "italic",
      padding: "12px",
      textAlign: "center",
      backgroundColor: "var(--background-secondary)",
      borderRadius: "4px",
    },
    description: {
      color: "var(--text-muted)",
      fontSize: "14px",
      marginBottom: "16px",
      lineHeight: "1.4",
    },
  };

  const getModules = () => {
    if (!UserSettingsProtoStore) {
      UserSettingsProtoStore = Webpack.getModule(
        (m) => m?.getName?.() === "UserSettingsProtoStore",
        { searchExports: true }
      );
    }
    if (!UserSettingsProtoUtils) {
      UserSettingsProtoUtils = Webpack.getModule(
        (m) => m?.ProtoClass?.typeName?.endsWith(".PreloadedUserSettings"),
        { searchExports: true }
      );
    }
    return { UserSettingsProtoStore, UserSettingsProtoUtils };
  };

  const saveSettings = () => {
    Data.save(meta.name, "settings", settings);
  };

  const getCurrentStatus = () => {
    try {
      const { UserSettingsProtoStore } = getModules();
      return (
        UserSettingsProtoStore?.settings?.status?.status?.value || "online"
      );
    } catch {
      return "online";
    }
  };

  const updateStatus = (toStatus) => {
    if (getCurrentStatus() === toStatus) return;

    try {
      const { UserSettingsProtoUtils } = getModules();
      UserSettingsProtoUtils?.updateAsync?.(
        "status",
        (statusSetting) => {
          if (!statusSetting) return;
          try {
            statusSetting.status.value = toStatus;
          } catch {
            statusSetting.value = toStatus;
          }
        },
        0
      );
    } catch (error) {
      console.error("[GameZen] Error updating status:", error);
    }
  };

  const activateDND = () => {
    if (fakeStatusActivated) return;

    try {
      lastKnownRealStatus = getCurrentStatus();
      updateStatus("dnd");
      fakeStatusActivated = true;
    } catch (error) {
      console.error("[GameZen] Error activating DND:", error);
    }
  };

  const deactivateDND = () => {
    if (!fakeStatusActivated) return;

    try {
      updateStatus(lastKnownRealStatus);
      lastKnownRealStatus = null;
      fakeStatusActivated = false;
    } catch (error) {
      console.error("[GameZen] Error deactivating DND:", error);
    }
  };

  const checkActivity = (LocalActivityStore) => {
    try {
      const activity = LocalActivityStore.getPrimaryActivity();

      // No game activity (type 0 = Playing)
      if (activity?.type !== 0) {
        return deactivateDND();
      }

      // Game is in ignored list
      if (settings.ignoredGames.includes(activity.name)) {
        return deactivateDND();
      }

      // Special handling for League of Legends
      if (
        activity.name === "League of Legends" &&
        activity.state !== "In Game"
      ) {
        return deactivateDND();
      }

      activateDND();
    } catch (error) {
      console.error("[GameZen] Error checking activity:", error);
    }
  };

  const observeActivity = () => {
    const LocalActivityStore = Webpack.getStore("LocalActivityStore");

    if (!LocalActivityStore) {
      console.error("[GameZen] LocalActivityStore not found");
      return;
    }

    const handleActivityChange = () => {
      if (scheduledRecheck !== null) {
        clearTimeout(scheduledRecheck);
      }
      scheduledRecheck = setTimeout(() => {
        scheduledRecheck = null;
        checkActivity(LocalActivityStore);
      }, 3000);
    };

    unsubscribe = LocalActivityStore.addChangeListener(handleActivityChange);

    // Check activity immediately on start
    checkActivity(LocalActivityStore);
  };

  // Settings Panel Component
  const SettingsPanel = () => {
    const [ignoredGames, setIgnoredGames] = useState(
      settings.ignoredGames || []
    );
    const [newGame, setNewGame] = useState("");

    const addGame = useCallback(() => {
      const gameName = newGame.trim();
      if (gameName.length === 0 || ignoredGames.includes(gameName)) return;

      const updatedGames = [...ignoredGames, gameName];
      setIgnoredGames(updatedGames);
      settings.ignoredGames = updatedGames;
      saveSettings();
      setNewGame("");
    }, [newGame, ignoredGames]);

    const removeGame = useCallback(
      (gameToRemove) => {
        const updatedGames = ignoredGames.filter(
          (game) => game !== gameToRemove
        );
        setIgnoredGames(updatedGames);
        settings.ignoredGames = updatedGames;
        saveSettings();
      },
      [ignoredGames]
    );

    const handleKeyPress = useCallback(
      (e) => {
        if (e.key === "Enter") addGame();
      },
      [addGame]
    );

    return React.createElement(
      "div",
      { style: styles.container },
      React.createElement("div", { style: styles.title }, "GameZen Settings"),
      React.createElement(
        "div",
        { style: styles.description },
        "Games in this list will not trigger Do Not Disturb mode when launched."
      ),
      React.createElement("div", { style: styles.subtitle }, "Ignored Games"),
      ignoredGames.length === 0
        ? React.createElement(
            "div",
            { style: styles.emptyState },
            "No games ignored. Add games below to exclude them from auto-DND."
          )
        : React.createElement(
            "ul",
            { style: styles.gameList },
            ignoredGames.map((game) =>
              React.createElement(
                "li",
                { key: game, style: styles.gameItem },
                React.createElement("span", { style: styles.gameName }, game),
                React.createElement(
                  "button",
                  {
                    onClick: () => removeGame(game),
                    style: styles.removeButton,
                    onMouseEnter: (e) => {
                      e.target.style.backgroundColor =
                        "var(--button-danger-background-hover)";
                    },
                    onMouseLeave: (e) => {
                      e.target.style.backgroundColor =
                        "var(--button-danger-background)";
                    },
                  },
                  "Remove"
                )
              )
            )
          ),
      React.createElement(
        "div",
        { style: styles.inputContainer },
        React.createElement("input", {
          type: "text",
          value: newGame,
          onChange: (e) => setNewGame(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "Enter game name...",
          style: styles.input,
        }),
        React.createElement(
          "button",
          {
            onClick: addGame,
            style: styles.addButton,
            onMouseEnter: (e) => {
              e.target.style.backgroundColor =
                "var(--button-positive-background-hover)";
            },
            onMouseLeave: (e) => {
              e.target.style.backgroundColor =
                "var(--button-positive-background)";
            },
          },
          "Add"
        )
      )
    );
  };

  return {
    start() {
      try {
        getModules();
        observeActivity();
      } catch (error) {
        console.error("[GameZen] Error starting plugin:", error);
      }
    },

    stop() {
      try {
        if (scheduledRecheck !== null) {
          clearTimeout(scheduledRecheck);
          scheduledRecheck = null;
        }
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        deactivateDND();
        saveSettings();
      } catch (error) {
        console.error("[GameZen] Error stopping plugin:", error);
      }
    },

    getSettingsPanel() {
      return React.createElement(SettingsPanel);
    },
  };
};

module.exports = gameZen;
