/**
 * Facebook Fan Gate
 * Pure JS implementation of fan gate using Facebook Javascript SDK
 *
 * @author Marek Vavrecan, vavrecan@gmail.com
 * @copyright 2013 Marek Vavrecan
 * @license http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License, version 3
 * @version 1.0.0
 */

/**
 * Constructor
 * @param params flat object containing fbPageId, onChangeStatus and fbInstance
 * @constructor
 */
function FacebookFangate(params) {
    var self = this;

    /**
     * Use as last status
     * @type boolean
     */
    self.likes = false;

    /**
     * Debug message
     * @param message
     */
    self.debug = function(message, object) {
        if (typeof(params.debug) != "undefined")
            console.log(message, object);
    };

    // check for FB instance and use it if needed
    self.fbInstance = (typeof params.fbInstance == "object") ? params.fbInstance : null;

    if (self.fbInstance == null) {
        if (typeof(FB) == "undefined")
            throw new Error("Facebook library is not initialized");
        else
            self.fbInstance = FB;
    }

    // set facebook object id we will check for like
    if (typeof (params.fbPageId) == "undefined")
        throw new Error("fbPageId parameter was not passed");

    self.fbPageId = params.fbPageId;

    // set callback function handler
    if (typeof (params.onChangeStatus) != "function")
        throw new Error("onChangeStatus parameter must be function");

    self.onChangeStatus = params.onChangeStatus;

    /**
     * Check whenever is logged user liking the page
     */
    self.checkLike = function() {
        self.debug("checking for like", self.fbPageId);

        // do this check using FQL
        var fqlQuery = "SELECT uid FROM page_fan WHERE page_id = " + self.fbPageId + "and uid = me()";
        var query = self.fbInstance.Data.query(fqlQuery);

        query.wait(function(rows) {
            // query was run, user is liking page if there is row found
            var isLiking = rows.length > 0;

            // call callback status update
            if (self.likes !== isLiking)
                self.onChangeStatus(isLiking);
            self.likes = isLiking;
        }, function(error) {
            // failed, the only error I can think of is login status problem
            if (self.likes !== false)
                self.onChangeStatus(false);
            self.likes = false;
        });
    }

    /**
     * Check for permission
     * @param callback
     */
    self.hasPermission = function(permission, callback) {
        // check for user_likes permission
        var fqlQuery = "SELECT " + permission + " FROM permissions WHERE uid = me()";
        var query = self.fbInstance.Data.query(fqlQuery);

        query.wait(function(rows) {
            // there is something wrong with the results
            if (rows.length == 0) {
                self.debug("Permission SQL returned no rows", rows);
                return;
            }

            // return
            callback(rows[0][permission] == "1");
        });
    };

    /**
     * Listen on user login
     */
    self.fbInstance.Event.subscribe('auth.authResponseChange', function(response) {
        self.debug(response, "auth.login");

        if (typeof(response.status) != "undefined" && response.status == "connected") {
            // check for user_likes permission
            self.hasPermission("user_likes", function(has) {
                // only check for likes if user has this permission
                if (has)
                    self.checkLike();
            });
        }
    });

    /**
     * Listen on like event
     */
    self.fbInstance.Event.subscribe('edge.create', function(href, widget) {
        self.debug(href, "edge.create");
        self.checkLike();
    });

    /**
     * Listen on unlike event
     */
    self.fbInstance.Event.subscribe('edge.remove', function(href, widget) {
        self.debug(href, "edge.remove");
        self.checkLike();
    });

    // call initial check
    self.checkLike();
};
