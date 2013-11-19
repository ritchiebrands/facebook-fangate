# Facebook Fan Gate

This is full client side implementation of fan gate using Facebook Javascript SDK.

Implementation requires `user_likes` permission from facebook user.

### How to use
```html
<script src="facebook-fangate.js" type="text/javascript"></script>
```

```javascript
// insert into fbAsyncInit or after FB object is initialized
var gate = new FacebookFangate({
    fbPageId       : '202758919816608', // page we want to use for fan gate
    onChangeStatus : function(like) {
        if (like) {
            // update UI after user liked page
        }
        else {
            // update UI after user is no longer liking page
        }
    }
    // debug       : 1, // uncomment to enable debug output
});
```

in case you need to check for like manually or get last know like status do

```javascript
// last know like status
gate.likes;
// call check like status manually
gate.checkLike();
```

## Author
- [Marek Vavrecan](mailto:vavrecan@gmail.com)
- [Donate by PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=DX479UBWGSMUG&lc=US&item_name=Friend%20List%20Watcher&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

## License
- [GNU General Public License, version 3](http://www.gnu.org/licenses/gpl-3.0.html)