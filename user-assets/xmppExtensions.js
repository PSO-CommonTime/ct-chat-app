var Presence = (function () {
    function Presence(conn) {
        this.conn = conn;
        this.identities = [];
        this.features = [];
        this.identities.push({ category: 'pubsub', type: 'pep', name: '', lang: '' });
        this.identities.push({ category: 'account', type: 'registered', name: '', lang: '' });
        this.features.push('http://jabber.org/protocol/nameupdate');
        this.features.push('http://jabber.org/protocol/nameupdate+notify');
        this.features.push('http://jabber.org/protocol/commands');
        this.features.push('http://jabber.org/protocol/disco#info');
        this.features.push('http://jabber.org/protocol/offline');
        this.features.push('http://jabber.org/protocol/pubsub');
        this.features.push('http://jabber.org/protocol/pubsub#auto-create');
        this.features.push('http://jabber.org/protocol/pubsub#auto-subscribe');
        this.features.push('http://jabber.org/protocol/pubsub#create-notes');
        this.features.push('http://jabber.org/protocol/pubsub#delete-items');
        this.features.push('http://jabber.org/protocol/pubsub#delete-nodes');
        this.features.push('http://jabber.org/protocol/pubsub#filtered-notifications');
        this.features.push('http://jabber.org/protocol/pubsub#modify-affiliations');
        this.features.push('http://jabber.org/protocol/pubsub#outcast-affiliation');
        this.features.push('http://jabber.org/protocol/pubsub#persistent-items');
        this.features.push('http://jabber.org/protocol/pubsub#publish');
        this.features.push('http://jabber.org/protocol/pubsub#purge-nodes');
        this.features.push('http://jabber.org/protocol/pubsub#retract-items');
        this.features.push('http://jabber.org/protocol/pubsub#retrieve-affiliations');
        this.features.push('http://jabber.org/protocol/pubsub#retrieve-items');
        this.features.push('http://jabber.org/protocol/pubsub#retrieve-subscriptions');
        this.features.push('http://jabber.org/protocol/pubsub#subscribe');
        this.features.push('msgoffline');
        this.features.push('vcard-temp');
    }
    Presence.prototype.generateAndSendCaps = function () {
        var hash = this.generateVersionHash();
        var pres = $pres({ from: 'htmlclient@localhost' })
            .c('c', { xmlns: 'http://jabber.org/protocol/caps', hash: 'sha-1', node: 'cti-xmpp', ver: hash });
        console.log(pres.tree());
        console.log(hash);
        this.conn.send(pres);
        // var iq = $iq({ type: 'set'})
        //           .c('feature', { var: 'http://jabber.org/protocol/nick' })
        //           .up()
        //           .c('feature', { var: 'http://jabber.org/protocol/nick+notify' });
        // console.log(iq.tree());
        // this.conn.sendIQ(iq, (s) => this.setFeatureResponse(s), (s) => this.setFeatureResponse(s));
    };
    Presence.prototype.setFeatureResponse = function (s) {
        console.log(s);
    };
    Presence.prototype.sortProperty = function (array, property) {
        array.sort(function (a, b) {
            if (a[property] > b[property])
                return -1;
            if (a[property] < b[property])
                return 1;
            return 0;
        });
    };
    Presence.prototype.sortIdentities = function (ids) {
        this.sortProperty(ids, 'category');
        this.sortProperty(ids, 'type');
        this.sortProperty(ids, 'lang');
    };
    Presence.prototype.generateVersionHash = function () {
        var str = '';
        this.sortIdentities(this.identities);
        this.features.sort();
        for (var _i = 0, _a = this.identities; _i < _a.length; _i++) {
            var i = _a[_i];
            str += i.category + '/' + i.type + '/' +
                (i.lang || '') + '/' + (i.name || '');
            str += '<';
        }
        str += this.features.join('<');
        str += '<';
        var ver = window.SHA1.b64_sha1(str);
        return ver;
    };
    return Presence;
}());
/*
*   --------------------------------------------------
*   NK XMPP Extensions: Roster
*   --------------------------------------------------
*
*   Provides Roster support for NK XMPP Extensions
*
*   Features include:
*
*
*   --------------------------------------------------
*/
var Roster = (function () {
    function Roster(conn, ns) {
        var _this = this;
        this.conn = conn;
        this.ctins = ns;
        this.currJid = this.conn.jid.split('/')[0].toLowerCase();
        this.conn.addHandler(function (s) { return _this.handleRosterSubscriptionRequests(s); }, null, 'presence', 'subscribe', null, null, { matchBareFromJid: true });
    }
    Roster.prototype.requestRosterSubscription = function (user) {
        var _this = this;
        var pres = $pres({ to: user, type: 'subscribe' });
        this.conn.addHandler(function (stanza) { return _this.rosterRequestHandler(stanza); }, 'jabber:iq:roster', 'iq', null, null, null);
        this.conn.sendIQ(pres.tree());
    };
    Roster.prototype.rosterRequestHandler = function (stanza) {
        var user = stanza.firstChild.firstChild.getAttribute('jid').toLowerCase();
        var ask = stanza.firstChild.firstChild.getAttribute('ask');
        var sub = stanza.firstChild.firstChild.getAttribute('subscription');
        this.updateSubscriptionForCurrentRoster(user, (ask ? true : false), sub);
        return false;
    };
    Roster.prototype.updateSubscriptionForCurrentRoster = function (user, ask, sub) {
        var currRoster = cti.store.xmpp[this.ctins].contacts;
        for (var _i = 0, currRoster_1 = currRoster; _i < currRoster_1.length; _i++) {
            var r = currRoster_1[_i];
            if (r.username.toLowerCase() === user.toLowerCase())
                r.subscriptionStatus = (!ask ? 'awaiting' : sub);
        }
    };
    Roster.prototype.handleRosterSubscriptionRequests = function (stanza) {
        var _this = this;
        var from = stanza.getAttribute('from').toLowerCase();
        var currRoster = cti.store.xmpp[this.ctins].contacts;
        var requestSent = false;
        for (var _i = 0, currRoster_2 = currRoster; _i < currRoster_2.length; _i++) {
            var r = currRoster_2[_i];
            if (r.username.toLowerCase() === from && r.subscriptionStatus === 'none') {
                delete r.subscriptionStatus;
                requestSent = true;
            }
        }
        if (requestSent) {
            var acknowledge = $pres({ to: from, type: 'subscribed' });
            this.conn.sendIQ(acknowledge.tree());
        }
        else {
            var iq = $iq({ to: this.currJid, type: 'set' })
                .c('query', { xmlns: 'jabber:iq:roster' })
                .c('item', { jid: from, subscription: 'both' });
            this.conn.sendIQ(iq);
            this.conn.addHandler(function (stanza) { return _this.rosterRequestHandler(stanza); }, 'jabber:iq:roster', 'iq', null, null, null);
            return true;
        }
    };
    Roster.prototype.acceptSubscriptionRequest = function (event) {
        event.stopImmediatePropagation();
        var user = event.target.getAttribute('user').toLowerCase();
        var acknowledge = $pres({ to: user, type: 'subscribed' });
        var mutualSubscribe = $pres({ to: user, type: 'subscribe' });
        this.conn.sendIQ(acknowledge.tree());
        //this.conn.addHandler((stanza) => this.rosterRequestHandler(stanza), 'jabber:iq:roster', 'iq', null, null, null);
        this.conn.sendIQ(mutualSubscribe.tree());
        // var iq = $iq({ to: this.currJid, type: 'set' })
        //           .c('query', { xmlns: 'jabber:iq:roster' })
        //           .c('item', { jid: user, subscription: 'both' });
        // this.conn.sendIQ(iq);
        var currRoster = cti.store.xmpp[this.ctins].contacts;
        var requestSent = false;
        for (var _i = 0, currRoster_3 = currRoster; _i < currRoster_3.length; _i++) {
            var r = currRoster_3[_i];
            if (r.username.toLowerCase() === user)
                delete r.subscriptionStatus;
        }
    };
    return Roster;
}());
var AvatarManager = (function () {
    function AvatarManager() {
    }
    AvatarManager.prototype.saveVCardAvyToDisk = function (photoNode, rosterUser) {
        var _this = this;
        if (!window.requestFileSystem)
            return;
        var writeAvyToDisk = this.writeAvyToDisk;
        this.rosterUser = rosterUser;
        this.type = photoNode.childNodes[0].textContent;
        this.data = photoNode.childNodes[1].textContent;
        this.blob = this.createBlobFromB64(this.data, this.type);
        if (rosterUser.vcard.avatar) {
            window.resolveLocalFileSystemURL(rosterUser.vcard.avatar, function (entry) { return _this.resolveFileSystemUrlSuccess(entry); }, function (e) { return _this.resolveFileSystemUrlFail(e); });
        }
        else {
            this.writeAvyToDisk();
        }
    };
    AvatarManager.prototype.resolveFileSystemUrlSuccess = function (entry) {
        var _this = this;
        entry.remove(function () { return _this.removeFileComplete(); }, function () { return _this.removeFileComplete(); });
    };
    AvatarManager.prototype.removeFileComplete = function () {
        this.writeAvyToDisk();
    };
    AvatarManager.prototype.resolveFileSystemUrlFail = function (e) {
        console.log('Cannot resolve file entry, proceeding with new avatar');
        this.writeAvyToDisk();
    };
    AvatarManager.prototype.writeAvyToDisk = function () {
        var blob = this.blob;
        var callback = this.saveAvyToRosterVCard;
        var _this = this;
        var avyFileName = cti.newGuid() + '.png';
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
            fs.root.getFile(avyFileName, { create: true }, function (fileEntry) {
                fs.root.getDirectory('userAvatars', { create: true }, function (dir) {
                    fileEntry.moveTo(dir, avyFileName, function (newEntry) {
                        console.log(newEntry.fullPath);
                        console.log(newEntry.toURL());
                        newEntry.createWriter(function (fw) {
                            fw.onwriteend = function () {
                                console.log('Write complete');
                                callback(newEntry.toURL(), _this);
                            };
                            fw.onerror = function (err) {
                                console.log(err);
                            };
                            fw.write(blob);
                        });
                    });
                });
            });
        });
    };
    AvatarManager.prototype.saveAvyToRosterVCard = function (avyFilePath, _this) {
        _this.rosterUser.vcard.avatar = avyFilePath;
    };
    /*
    * Creates a new Blob from Base 64
    *
    * This is needed to create suitable files.
    * Make sure the data: prefix (everyting up to
    * the first comma) has been stripped from the
    * supplied base64Data.
    *
    * @param base64Data - data for file
    * @param fileType - type of file ex 'image/png'
    */
    AvatarManager.prototype.createBlobFromB64 = function (base64Data, type) {
        var fileType = { type: type };
        var sliceSize = 512;
        var byteCharacters = atob(base64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, fileType);
    };
    return AvatarManager;
}());
/*
*   --------------------------------------------------
*   NK XMPP Extensions: VCard
*   --------------------------------------------------
*
*   Provides VCard support for NK XMPP Extensions
*
*   Features include:
*       Requesting vCard per user
*       Requesting vCard per roster
*       Updating user vCard
*
*   --------------------------------------------------
*/
var VCard = (function () {
    function VCard(conn, ns) {
        var _this = this;
        this.conn = conn;
        this.ctins = ns;
        this.currJid = this.conn.jid.split('/')[0];
        this.avyUpdates = [];
        this.conn.addHandler(function (s) { return _this.pubSubIQ(s); }, 'http://jabber.org/protocol/nick', 'presence');
        this.conn.addHandler(function (s) { return _this.saveVCard(s); }, 'jabber:client', 'iq');
    }
    /*
    * Requests individual vCard for supplied user
    *
    * Default will be for current user if no other
    * user is supplied to look up
    *
    * @param user - the user to lookup
    * @param [callback] - callback function
    */
    VCard.prototype.requestVCard = function (user, callback) {
        var iq = $iq({ to: user, id: 'v1', type: 'get' })
            .c('vcard', { xmlns: 'vcard-temp' });
        if (callback)
            this.callback = callback;
        this.conn.send(iq.tree());
        //this.conn.sendIQ(iq.tree(), (stanza) => this.saveVCard(stanza));
    };
    /*
    * Requests vCards for each user in current roster
    * @param [copyCtiRoster] - an optional boolean to rebind roster entities
    */
    VCard.prototype.requestAllRosterProfiles = function (copyCtiRoster) {
        //this.conn.addHandler((s) => this.saveVCard(s), 'jabber:client', 'iq');
        this.requestVCard(this.currJid);
        var roster = cti.store.xmpp[this.ctins].contacts;
        for (var i = 0; i < roster.length; i++) {
            // This is a bit of a hack for CTI. It allows us
            // to specify a function to be called on receipt
            // of the last roster vcard. We can use this to
            // rebind any roster instances used throughout
            // the app so things like presence and vcards
            // can be persisted between app sessions / restarts.
            if (copyCtiRoster && i === roster.length - 1)
                var callback = cti.mapContactReferences;
            if (i === roster.length - 1)
                this.rosterCountMax = roster.length;
            this.requestVCard(roster[i].username, callback);
        }
    };
    VCard.prototype.setVCard = function (items, photoChanged, newB64) {
        var _this = this;
        var iq = $iq({ type: 'set' })
            .c('vcard', { xmlns: 'vcard-temp' });
        for (var i in items) {
            if (i !== 'avatar')
                iq.c(i).t(items[i]).up();
        }
        if (photoChanged) {
            iq.c('photo')
                .c('type').t('image/png').up()
                .c('binval').t(newB64);
        }
        cti.store.currentJidProfile = items;
        this.conn.sendIQ(iq.tree(), function (s) { return _this.setVCardResponse(s); }, function (s) { return _this.setVCardResponse(s); });
        if (items.nickname) {
            var pres = $pres().c('nick', { xmlns: 'http://jabber.org/protocol/nick' }, items.nickname);
            this.conn.send(pres.tree());
        }
    };
    VCard.prototype.pubSubIQ = function (stanza) {
        var user = stanza.getAttribute('from').split('/')[0];
        var name = stanza.childNodes[0];
        var currRoster = cti.store.xmpp[this.ctins].contacts;
        for (var _i = 0, currRoster_4 = currRoster; _i < currRoster_4.length; _i++) {
            var r = currRoster_4[_i];
            if (r.username.toLowerCase() === user.toLowerCase())
                r.nickname = name.textContent;
        }
        cti.utils.updatePage();
        return true;
    };
    VCard.prototype.setVCardResponse = function (result) {
        this.requestVCard(this.currJid);
        return false;
    };
    /*
    * Private vCard response handler that will
    * save the returned vCard stanza into the
    * appropriate place within cti.store
    *
    * @param stanza - the vCard response stanza
    */
    VCard.prototype.saveVCard = function (stanza) {
        if (!this.rosterCountNow)
            this.rosterCountNow = 1;
        var user = stanza.getAttribute('from');
        if (user !== this.currJid) {
            var user = stanza.getAttribute('from');
            if (stanza.childNodes.length > 0) {
                var currRoster = cti.store.xmpp[this.ctins].contacts;
                var vCardNodes = stanza.childNodes[0].childNodes;
                var rosterContact = null;
                var rosterAvy = null;
                var profile = {};
                for (var _i = 0, currRoster_5 = currRoster; _i < currRoster_5.length; _i++) {
                    var r = currRoster_5[_i];
                    if (r.username.toLowerCase() === user.toLowerCase()) {
                        rosterContact = r;
                        break;
                    }
                }
                for (var i = 0, max = vCardNodes.length; i < max; i++) {
                    var node = vCardNodes[i];
                    if (node.nodeName === 'photo') {
                        // TODO: Add check to see if we already have this file
                        rosterAvy = node;
                    }
                    else
                        profile[node.nodeName] = node.textContent;
                }
                if (rosterContact) {
                    rosterContact.vcard = profile;
                    if (profile.nickname)
                        rosterContact.nickname = profile.nickname;
                }
                // AVYS
                if (rosterAvy) {
                    var avyManager = new AvatarManager();
                    avyManager.saveVCardAvyToDisk(node, rosterContact);
                }
            }
            if (this.rosterCountNow === (this.rosterCountMax || 1)) {
                delete this.rosterCountNow;
                delete this.rosterCountMax;
                if (this.callback) {
                    this.callback();
                    delete this.callback;
                }
            }
            else
                this.rosterCountNow++;
        }
        else {
            if (stanza.childNodes.length > 0) {
                var child = stanza.childNodes[0];
                if (child.nodeName === 'vcard') {
                    var profile = {};
                    for (var i = 0; i < child.childNodes.length; i++) {
                        var vcardChild = child.childNodes[i];
                        if (vcardChild.nodeName !== 'photo')
                            profile[vcardChild.nodeName] = vcardChild.textContent;
                    }
                    for (var p in profile) {
                        cti.store.currentJidProfile[p] = profile[p];
                    }
                }
            }
        }
        return true;
    };
    return VCard;
}());
/*
*   --------------------------------------------------
*   NK XMPP Extensions for CTI V1
*   --------------------------------------------------
*
*   A small extension library for CTI XMPP. Provides
*   more extended featurs utilising the XMPP protocol
*
*   --------------------------------------------------
*/
var NkXmppExtensions = (function () {
    function NkXmppExtensions(config) {
        this.conn = cti.api.xmpp_connection;
        this.ctiNS = Object.keys(cti.store.xmpp)[0];
        if (config.presence)
            this.presence = new Presence(this.conn);
        if (config.vcard)
            this.vcard = new VCard(this.conn, this.ctiNS);
        if (config.roster)
            this.roster = new Roster(this.conn, this.ctiNS);
    }
    return NkXmppExtensions;
}());
