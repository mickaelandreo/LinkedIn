Linkedin = {
    config: {
        scrollDelay: 3000,
        actionDelay: 5000,
        nextPageDelay: 5000,
        // set to -1 for no limit
        maxRequests: 50,
        totalRequestsSent: 0,
        // set to true to add note in invites
        addNote: true,
        note: "Bonjour, je souhaiterai faire parti de votre réseau."
    },
    init: function (data, config) {
        console.info("INFO: Script en cours d\"initialisation sur la page...");
        console.debug("DEBUG: Descendre en bas de la page en " + config.scrollDelay + " ms");
        setTimeout(() => this.scrollBottom(data, config), config.actionDelay);
    },
    scrollBottom: function (data, config) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        console.debug("DEBUG: Monter en haut de la page en " + config.scrollDelay + " ms");
        setTimeout(() => this.scrollTop(data, config), config.scrollDelay);
    },
    scrollTop: function (data, config){
        window.scrollTo({ top: 0, behavior: "smooth" });
        console.debug("DEBUG: inspecting elements in " + config.scrollDelay + " ms");
        setTimeout(() => this.inspect(data, config), config.scrollDelay);
    },
    inspect: function (data, config) {
        var totalRows = this.totalRows(); 
        console.debug("DEBUG: total search results found on page are " + totalRows);
        if (totalRows >= 0) {
            this.compile(data, config);
        } else {
            console.warn("Attention : Fin de la recherche de résultat !");
            this.complete(config);
        }
    },
    compile: function (data, config) {
        var elements = document.getElementsByClassName("search-result__action-button");
        data.pageButtons = [...elements].filter(function (element) {
            return element.textContent.trim() === "Connect";
        });
        if (!data.pageButtons || data.pageButtons.length === 0) {
            console.warn("ERROR: Aucun bouton \"Ajout de contact\" trouvé sur cette page!");
            console.info("INFO: Changement à la page suivante automatique...");
            setTimeout(() => { this.nextPage(config) }, config.nextPageDelay);
        } else {
            data.pageButtonTotal = data.pageButtons.length;
            console.info("INFO: " + data.pageButtonTotal + " boutons \"Ajout de contact\" ");
            data.pageButtonIndex = 0;
            console.debug("DEBUG: starting to send invites in " + config.actionDelay + " ms");
            setTimeout(() => { this.sendInvites(data, config) }, config.actionDelay);
        }
    },
    sendInvites: function (data, config) {
        console.debug("remaining requests " + config.maxRequests);
        if (config.maxRequests == 0){
            console.info("INFO: Maximum de requête atteint pour cette page !");
            this.complete(config);
        } else {
            console.debug("DEBUG: sending invite to " + (data.pageButtonIndex + 1) + " out of " + data.pageButtonTotal);
            var button = data.pageButtons[data.pageButtonIndex];
            button.click();
            if (config.addNote && config.note) {
                console.debug("DEBUG: clicking Add a note in popup, if present, in " + config.actionDelay + " ms");
                setTimeout(() => this.clickAddNote(data, config), config.actionDelay);
            } else {
                console.debug("DEBUG: clicking done in popup, if present, in " + config.actionDelay + " ms");
                setTimeout(() => this.clickDone(data, config), config.actionDelay);
            }
        }
    },
    clickAddNote: function (data, config) {
        var buttons = document.querySelectorAll("button");
        var addNoteButton = Array.prototype.filter.call(buttons, function (el) {
            return el.textContent.trim() === "Add a note";
        });
        // Click the first done button
        if (addNoteButton && addNoteButton[0]) {
            console.debug("DEBUG: clicking add a note button to paste note");
            addNoteButton[0].click();
            console.debug("DEBUG: pasting note in " + config.actionDelay);
            setTimeout(() => this.pasteNote(data, config), config.actionDelay);
        } else {
            console.debug("DEBUG: add note button not found, clicking done on the popup in " + config.actionDelay);
            setTimeout(() => this.clickDone(data, config), config.actionDelay);
        }
    },
    pasteNote: function (data, config) {
        noteTextBox = document.getElementById("custom-message")
        noteTextBox.value = config.note;
        noteTextBox.dispatchEvent(new Event("input", {
            bubbles: true
        }));
        console.debug("DEBUG: clicking done in popup, if present, in " + config.actionDelay + " ms");
        setTimeout(() => this.clickDone(data, config), config.actionDelay);
    },
    clickDone: function (data, config) {
        var buttons = document.querySelectorAll("button");
        var doneButton = Array.prototype.filter.call(buttons, function (el) {
            return el.textContent.trim() === "Done";
        });
        // Click the first done button
        if (doneButton && doneButton[0]) {
            console.debug("DEBUG: clicking done button to close popup");
            doneButton[0].click();
        } else {
            console.debug("DEBUG: done button not found, clicking close on the popup in " + config.actionDelay);
        }
        setTimeout(() => this.clickClose(data, config), config.actionDelay);
    },
    clickClose: function (data, config) {
        var closeButton = document.getElementsByClassName("artdeco-modal__dismiss artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary ember-view");
        if (closeButton && closeButton[0]) {
            closeButton[0].click();
        }
        console.info("INFO: invite sent to " + (data.pageButtonIndex + 1) + " out of " + data.pageButtonTotal);
        config.maxRequests--;
        config.totalRequestsSent++;
        if (data.pageButtonIndex === (data.pageButtonTotal - 1)) {
            console.debug("DEBUG: all connections for the page done, going to next page in " + config.actionDelay + " ms");
            setTimeout(() => this.nextPage(config), config.actionDelay);
        } else {
            data.pageButtonIndex++;
            console.debug("DEBUG: sending next invite in " + config.actionDelay + " ms");
            setTimeout(() => this.sendInvites(data, config), config.actionDelay);
        }
    },
    nextPage: function (config) {
        var pagerButton = document.getElementsByClassName("artdeco-pagination__button--next");
        if (!pagerButton || pagerButton.length === 0) {
            console.info("INFO: Pas de bouton \"Page suivante\" trouvé !");
            return this.complete(config);
        }
        console.info("INFO: Chargement de la page suivante...");
        pagerButton[0].children[0].click();
        setTimeout(() => this.init({}, config), config.nextPageDelay);
    },
    complete: function (config) {
        console.info("INFO: Script terminé après avoir envoyé " + config.totalRequestsSent + " demandes de connexion");
    },
    totalRows: function () {
        var search_results = document.getElementsByClassName("search-result");
        if (search_results && search_results.length != 0) {
            return search_results.length;
        } else {
            return 0;
        }
    }
}

Linkedin.init({}, Linkedin.config);
