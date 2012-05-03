// ==UserScript==
// @name       nick's dominion enhancer
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  enter something useful
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @match      *dominion.isotropic.org*
// @copyright  2012+, You
// ==/UserScript==

window.SuperDominion = new function() {
    var self = this;
    var current_hand;
    self.cards = {};
    
    self.redrawUI = function() {
        self.redrawHand();
    };
    
    self.redrawHand = function() {
        var hand = new self.hand();
        hand.draw();
    };
    window.setInterval(self.redrawUI, 500);
};

window.SuperDominion.hand = function(name) {
    var self = this;
    var cards;
    var drawn = false;
    
    self.toString = function() {
        var s = '';
        for (var i in cards) {
            s += cards[i] + ' ' + i + '; ';
        }
        return s;
    };
    
    self.load = function() {
        drawn = false;
        if ($('.hand').data('redrawn')) {
            drawn = true;
            self = $('.hand').data('redrawn');
            return;
        }
        cards = {};
        $(document).find('.hand').find('.imcard').each(function() {
            var count = 1;
            var card_name = $(this).find('div:first').attr('cardname');
            $(this).find('br').each(function() {
                count++;
            });
            cards[card_name] = count;
        });
        console.log('new hand' + self.toString());
    };
    
    self.draw = function() {
        if (!drawn) {
            for (name in cards) {
                if (! window.SuperDominion.cards[name]) {
                    window.SuperDominion.cards[name] = new window.SuperDominion.card(name);
                }
            }
            var fail = false;
            for (name in cards) {
                if (! window.SuperDominion.cards[name].ready) {
                    fail = true;
                } else {
                    var count = cards[name];
                    $('.hand div[cardname=' + name + ']').html(window.SuperDominion.cards[name].draw(count));
                }
            }
            if (fail) {
                $('.hand').data('redrawn', false);
            }
            else {
                $('.hand').data('redrawn', self);
            }
        }
    };
    
   self.load();
};

window.SuperDominion.card = function(name) {
    var name = name;
    var img_url;
    var self = this;
    
    self.ready = false;
    
    self.draw = function(count) {
        while (!img_url) {
        }
        console.log('draw: ' + img_url);
        var rendering = '';
        for (var i=0; i<count; i++) {
            var top = i*15;
            var left = i*-100;
            rendering += '<img style="position:relative;top:'+top+'px;left:'+left+'px;width:114px;height:182px;" src="' + img_url + '">';
        }
        return rendering;
    };
    
    var getImageUrl = function() {
        var the_url = "http://dominion.diehrstraits.com/?card=" + encodeURI(name);        
        console.log('lookup url: ' + the_url);
        GM_xmlhttpRequest({
            method : "GET",
            url : the_url,
            onload : function (response) {
                img_url = new String($(response.responseText).find('.card_img[title="'+name+'"]').attr('src'));
                img_url = 'http://dominion.diehrstraits.com/' + img_url.slice(2);
                console.log('img_url: ' + img_url);
                self.ready = true;
            }
        });
    };
    
    getImageUrl();
};
