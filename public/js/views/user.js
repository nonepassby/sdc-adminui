var Backbone = require('backbone');
var _ = require('underscore');


var ko = require('knockout');
var kb = require('knockback');
var BaseView = require('./base');
var VmsList = require('./vms-list');
var Vms = require('../models/vms');
var SSHKeys = require('../models/sshkeys');
var UserForm = require('./user-form');

var SSHKeyListItemTemplate = require('../tpl/sshkey-list-item.hbs');
var SSHKeyListItem = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    attributes: {'class':'item'},
    template: SSHKeyListItemTemplate,
    events: {
        'click .remove': 'onClickRemove'
    },
    onClickRemove: function() {
        var confirm = window.confirm("Are you sure you want to remove this key from the user's account?");
        if (confirm) {
            this.model.destroy();
        }
    }
});

var SSHKeysList = Backbone.Marionette.CollectionView.extend({
    itemView: SSHKeyListItem
});

var User = require('../models/user');
var UserView = Backbone.Marionette.ItemView.extend({
    template: require('../tpl/user.hbs'),
    id: 'page-user',
    events: {
        'click .edit-user': 'onClickEditUser',
        'click .add-key': 'onClickAddKey'
    },

    sidebar: 'users',

    url: function() {
        return _.str.sprintf('/users/%s', this.model.get('uuid'));
    },

    onClickEditUser: function(e) {
        var form = new UserForm({user: this.model});
        form.render();
    },

    onClickAddKey: function(e) {
        var AddKeyView = require('./sshkey-create');
        var view = new AddKeyView({
            user: this.model.get('uuid')
        });
        view.render();

        this.listenTo(view, 'saved', this.sshkeys.add);
    },

    initialize: function(options) {
        if (options.user) {
            this.model = options.user;
        } else {
            this.model = new User({uuid: options.uuid });
        }

        this.vms = new Vms({params: { owner_uuid: this.model.get('uuid') }});
        this.vms.fetch();

        this.sshkeys = new SSHKeys({user: this.model.get('uuid') });
        this.sshkeys.fetch();

        this.vmsList = new VmsList({collection: this.vms });
        this.sshkeysList = new SSHKeysList({collection: this.sshkeys });

        this.model.fetch();
    },

    onRender: function() {
        this.vmsList.setElement(this.$('.vms-list tbody')).render();
        this.sshkeysList.setElement(this.$('.ssh-keys .items')).render();

        this.stickit(this.model, {
            '.cn': 'cn',
            '.uuid': 'uuid',
            '.login': 'login',
            '.email': 'email',
            '.company': 'company',
            '.groups': 'groups'
        });
    }
});

module.exports = UserView;
