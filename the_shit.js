// ==UserScript==
// @name       theateam dominion enhancer
// @namespace  https://github.com/cozzzmo/dominion-enhancer
// @version    0.2
// @description  converts the lame generic cards into real card images
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @match      *dominion.isotropic.org*
// @copyright  2012+, theateam
// ==/UserScript==

addslashes = function(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
};

function clearLocalCache() {    //in case the cache gets bad data
    GM_listValues().map(GM_deleteValue);
}

window.SuperDominion = new function() {
    var self = this;
    var current_hand;
    self.cards = {};
            
    self.learnCard = function(name) {
        if (!self.cards[name]) {
            self.cards[name] = new self.Card(name);
        }
    };
    
    self.redrawUI = function() {
        var hand = new self.Hand();
        hand.draw();
    };
    
    window.setInterval(self.redrawUI, 100);
};

window.SuperDominion.Hand = function(name) {
    var self = this;
    
    self.cards = {};
    
    var loadFromCache = function() {
        if (!$('.hand').data('loaded')) {
            return false;
        }
        self = $('.hand').data('loaded');
        return true;
    };
    
    var cardsAreReady = function() {
        for (name in self.cards) {
            if (! window.SuperDominion.cards[name].ready) {
                return false;
            }
        }
        return true;
    };
    
    var alreadyDrawn = function() {
        if ($('.hand').data('drawn')) {
            return true;
        }
        return false;
    };
    
    var drawHand = function() {
        var max_count = 0;
        for (name in self.cards) {
            var count = self.cards[name];
            $('.hand div[cardname="' + name + '"]')
                .html(window.SuperDominion.cards[name].draw(count))
                .css('width', 114+((count-1)*20)+10);
            if (count > max_count) {
                max_count = count;
            }
        }
        $('.hand div').css('position', 'relative');
        $('.hand')
            .css('position', 'relative')
            .css('vertical-align', 'top')
            .css('vertical-align', 'top')
            .height(181+10+(15*max_count))
            .data('drawn', true);
    };
    
    self.draw = function() {
        if (alreadyDrawn()) {
            return true;
        }
        if (!cardsAreReady()) {
            return false;
        }
        drawHand();
        return true;
    };
    
    self.load = function() {
        if (loadFromCache()) {
            return;
        }
        cards = {};
        $(document).find('.hand').find('.imcard').each(function() {
            var card_name = $(this).find('div:first').attr('cardname');
            var count = 1;
            $(this).find('br').each(function() {
                count++;
            });
            window.SuperDominion.learnCard(card_name);
            self.cards[card_name] = count;
        });
        $('.hand').data('loaded', self);
    };
    
   self.load();
};

window.SuperDominion.Card = function(name) {
    var name = name;
    var img_url;
    var self = this;
    
    self.ready = false;
    
    var getImageUrl = function() {
        var cardname = encodeURI(name),
            cachekey = "CardImage." + cardname,
            storedSrc = GM_getValue(cachekey);

        function setURL(url) {
            img_url = url;
            self.ready = true;
        }

        if (storedSrc) {
            setURL(storedSrc);
        }
        else {
            var the_url = "http://dominion.diehrstraits.com/?card=" + encodeURI(name);        
            console.log('lookup url: ' + the_url);
            GM_xmlhttpRequest({
                method : "GET",
                url : the_url,
                onload : function (response) {
                    var x = '.card_img[title="'+addSlashes(name)+'"]';
                    var src = new String($(response.responseText).find(x).attr('src'));
                    var url = 'http://dominion.diehrstraits.com/' + src.slice(2);
                    GM_setValue(cachekey, img_url);
                    setURL(url);
                }
            });
        }
    };
    
    self.draw = function(count) {
        while (!img_url) {
        }
        var rendering = '';
        for (var i=0; i<count; i++) {
            var top = i*15;
            var left = i*20;
            rendering += '<img style="position:absolute;top:'+top+'px;left:'+left+'px;width:114px;height:182px;" src="' + img_url + '">';
        }
        return rendering;
    };
    
    getImageUrl();
};
