$(document).ready(function () {
    $('.header__burger').click(function () {
        $('.header__burger, .header__menu').toggleClass('active');
        $('body').toggleClass('lock');
    });

    $('.header__menu').click(function () {
        $('.header__burger, .header__menu').removeClass('active');
        $('body').removeClass('lock');
    });
});

/* конфигурация */
let width = 100; // ширина картинки
let count = 0.5; // видимое количество изображений

let list = carousel.querySelector('ul');
let listElems = carousel.querySelectorAll('li');

let position = 0; // положение ленты прокрутки

carousel.querySelector('.prev').onclick = function () {
    // сдвиг влево
    position += width * count;
    // последнее передвижение влево может быть не на 3, а на 2 или 1 элемент
    position = Math.min(position, 0)
    list.style.marginLeft = position + '1px';
};

carousel.querySelector('.next').onclick = function () {
    // сдвиг вправо
    position -= width * count;
    // последнее передвижение вправо может быть не на 3, а на 2 или 1 элемент
    position = Math.max(position, -width * (listElems.length - count));
    list.style.marginLeft = position + '1px';
};


var myMap;
// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);
function init() {
    // Создание экземпляра карты и его привязка к контейнеру с
    // заданным id ("map").
    myMap = new ymaps.Map('map', {
        // При инициализации карты обязательно нужно указать
        // её центр и коэффициент масштабирования.
        center: [55.68267782261003, 37.48201731640626],
        zoom: 10,
        controls: []
    });

    // Создание макета балуна
    MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        ' <div class="popover top">' +
        ' <a class="close" href="#">× </a>' +
        ' <div class="arrow"> </div>' +
        ' <div class="popover-inner">' +
        '$[[options.contentLayout observeSize minWidth=235 maxWidth=1200 maxHeight=350]]' +
        ' </div>' +
        ' </div>', {
        /**
        * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
        * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
        * @function
        * @name build
        */
        build: function () {
            this.constructor.superclass.build.call(this);
            this._$element = $('.popover', this.getParentElement());
            this.applyElementOffset();
            this._$element.find('.close')
                .on('click', $.proxy(this.onCloseClick, this));
        },

        /**
        * Удаляет содержимое макета из DOM.
        * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
        * @function
        * @name clear
        */
        clear: function () {
            this._$element.find('.close')
                .off('click');
            this.constructor.superclass.clear.call(this);
        },

        /**
        * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
        * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
        * @function
        * @name onSublayoutSizeChange
        */
        onSublayoutSizeChange: function () {
            MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

            if (!this._isElement(this._$element)) {
                return;
            }
            this.applyElementOffset();
            this.events.fire('shapechange');
        },

        /**
        * Сдвигаем балун, чтобы середина указывала на точку привязки.
        * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
        * @function
        * @name applyElementOffset
        */
        applyElementOffset: function () {
            this._$element.css({
                left: -(this._$element[0].offsetWidth / 2),
                top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
            });
        },

        /**
        * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
        * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
        * @function
        * @name onCloseClick
        */
        onCloseClick: function (e) {
            e.preventDefault();
            this.events.fire('userclose');
        },

        /**
        * Используется для автопозиционирования (balloonAutoPan).
        * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
        * @function
        * @name getClientBounds
        * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
        */
        getShape: function () {
            if (!this._isElement(this._$element)) {
                return MyBalloonLayout.superclass.getShape.call(this);
            }
            var position = this._$element.position();
            return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                [position.left, position.top], [
                    position.left + this._$element[0].offsetWidth,
                    position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight]
            ]));
        },
        /**
        * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
        * @function
        * @private
        * @name _isElement
        * @param {jQuery} [element] Элемент.
        * @returns {Boolean} Флаг наличия.
        */
        _isElement: function (element) {
            return element && element[0] && element.find('.arrow')[0];
        }
    }),

        // Создание вложенного макета содержимого балуна.
        MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            ' <div class="container text-white"><div class="column-md-6">$[properties.balloonHeader] </div>' +
            ' <div class="column-md-6">$[properties.balloonContent] </div> </div>'
        ),
        // Создание метки
        myPlacemark = new ymaps.Placemark(
            // Координаты метки
            [55.68267782261003, 37.48201731640626], {
            // Свойства
            // Текст метки
            hintContent: 'iResource',
            balloonHeader: ' <b>174 East 110th Street <br>(between Lexington & Third Aves.), <br>New York, NY 10029-3212 </b> <p>Ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper suscipit lobortis nisl ut aliquip ex. </p>',
            balloonContent: ' <form class="map_form"> <input type="text" placeholder="Your Name"> <input type="text" placeholder="Email Adress"> <textarea placeholder="Your Message"> </textarea> </form>'
        }, {
            iconLayout: 'default#imageWithContent',
            // Своё изображение иконки метки.
            iconImageHref: 'map_metka.png', // картинка иконки
            iconImageSize: [39, 39], // размеры картинки
            iconImageOffset: [-6, -10], // смещение картинки
            balloonShadow: false,
            balloonLayout: MyBalloonLayout,
            balloonContentLayout: MyBalloonContentLayout,
            balloonPanelMaxMapArea: 0,
            // Не скрываем иконку при открытом балуне.
            hideIconOnBalloonOpen: false,
            // И дополнительно смещаем балун, для открытия над иконкой.
            balloonOffset: [-100, -230]
        });
    // Добавление метки на карту
    myMap.geoObjects.add(myPlacemark);
}


