$(document).ready(function () {
    
    $.getJSON('json/jk-obj.json', function(data){
        let arrApartment =  data;

        // логика пагинации стрелки
        $('.paginationArrow').on('click', function() {
            let activePag = $('#pagination .active');
            if (!activePag.next().hasClass('paginationArrow')) {
                $(this).removeClass('disabled');
                activePag.next().find('span').trigger( "click" );
            } else {
                $(this).addClass('disabled');
            }
        });
        
        $('.filter-button-reset').addClass('disabled');
        //переменная для квартир, для карточки справа, для ползунков
        let notesOnPage = 10;
        let sliderPrice = document.getElementById('filter-price'),
            sliderArea = document.getElementById('filter-area'),
            price = getPrice(arrApartment);
        //создание ползунков
        range(sliderPrice, sliderArea, price);
        //загрузка квартир
        loadApprtment(arrApartment,notesOnPage);
        
        //__________filtr___________//
        let fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax, filtrArrApartment;
        $('.card-filter').on('mousemove', function() {
            filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
            getPrice(filtrArrApartment);
        });
        $('.count-rooms__btn').on('click', function() {
            if ($(this).hasClass('selected-room')) {
                $(this).toggleClass('selected-room');
            } else {
                $('.count-rooms__btn').removeClass('selected-room');
                $(this).toggleClass('selected-room')
            }
            filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
            getPrice(filtrArrApartment);
        });
        //show open-card apartment
        $('.filter-button-show').on('click', function() {
            filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
            if (filtrArrApartment == '') {
                $('.card-not-found').show();
                $('.card-apartment, .paginationArrow').hide();
            } else {
                $('.card-not-found').hide();
                $('.card-apartment, .paginationArrow').show();
            }
            loadApprtment(filtrArrApartment, notesOnPage);
            $('.filter-button-reset').removeClass('disabled');
        })
        //reset
        $('.filter-button-reset, .card-not-found-svg__button').on('click',function(){
            let sliderPrice = document.getElementById('filter-price'),
                sliderArea = document.getElementById('filter-area'),
                price = getPrice(arrApartment);
            sliderPrice.noUiSlider.destroy();
            sliderArea.noUiSlider.destroy();
            range(sliderPrice, sliderArea, price);
            $('.selected-room').click();
            filtrArrApartment = getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
            $('.filter-button-show').click();
            $('.filter-button-reset').addClass('disabled');
        });
    }); 
    function validation() {
        $('.application-form__phone input').on('focus', function() {
            $(this).val('+ 7')
        })
        $('.application-form__phone input').on('input', function() {
            $(this).val($(this).val().replace (/[^\+\d]/g, ''))
        });
        $('.application-form__name input').on('input', function() {
            $(this).val($(this).val().replace (/[0-9+ ]/g, ''))
        });
        $('.application-form input').on('input click', function() {
            let input1 = $(this),
                input2 = $(this).closest('.application-form__input').siblings('.application-form__input').find('input');
            if (input1.is(':valid') && input2.is(':valid') && input2.val() !== '') {
                $(this).closest('.application-form').find('.btn-yelow').removeClass('disabled');
            } else {
                $(this).closest('.application-form').find('.btn-yelow').addClass('disabled');
            }
        })
    }
    //загрузка квартир с обновлением страницы
    function loadApprtment(arrApartment, notesOnPage) {
        $('#wrapper-all-apartment .wrapper-apartment').remove();
        let noteOnePage = arrApartment.slice(0, notesOnPage);
        for (let noteOne of noteOnePage) {
            let wrapperApartment = $('#wrapper-all-apartment');
            let source = $("#template-apartment").html(),
                template = Handlebars.compile(source),
                html = template(noteOne);
            wrapperApartment.append(html);
            //деление цен на разряды
            $('.column-price, .info-apartment__price-size .price, .additional-info-body .price').each(function(i, el){
                let price = $(el).text();
                price = price.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
                $(el).text(price)
            })
        }
        let paginationArrow = $('.paginationArrow'),
            countNumPag = Math.ceil(arrApartment.length / notesOnPage);
        createPag(paginationArrow, countNumPag);
        let paginationLi = $('#pagination li:not(.paginationArrow)');
        pagination(arrApartment, paginationLi, notesOnPage);
        openCard();
        validation();
        $('#count-apartment').text(arrApartment.length)
        $('.like').on('click', function(event) {
            event.stopPropagation();
            $(this).toggleClass('like-fill');
        })
    };
    //range
    function range(sliderPrice, sliderArea, price) {
        //range price
        noUiSlider.create(sliderPrice, {
            start: [price.priceMin, price.priceMax],
            connect: true,
            step: 100,
            range: {
                'min': price.priceMin,
                'max': price.priceMax
            }
        });
        let rangePrice = [
            document.getElementById('price-range-1'),
            document.getElementById('price-range-2')
        ],  
            rangePrice1 = document.getElementById('price-range-1'),
            rangePrice2 = document.getElementById('price-range-2');

        sliderPrice.noUiSlider.on('update', function (values, handle) {
            values[handle] = values[handle].substr(0, values[handle].length - 3)
            rangePrice[handle].value = values[handle].replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
        });
        rangePrice1.addEventListener('change', function () {
            sliderPrice.noUiSlider.set([this.value.replace(/(\s){1,}/g, ''), null]);
        });
        rangePrice2.addEventListener('change', function () {
            sliderPrice.noUiSlider.set([null, this.value.replace(/(\s){1,}/g, '')]);
        });
        //range area
        noUiSlider.create(sliderArea, {
            start: [price.areaMin, price.areaMax],
            connect: true,
            step: 1,
            range: {
                'min': price.areaMin,
                'max': price.areaMax
            }
        });
        let rangeAreas = [
            document.getElementById('area-range-1'),
            document.getElementById('area-range-2')
        ],  
            rangeArea1 = document.getElementById('area-range-1'),
            rangeArea2 = document.getElementById('area-range-2');

        sliderArea.noUiSlider.on('update', function (values, handle) {
            values[handle] = values[handle].substr(0, values[handle].length - 3)
            rangeAreas[handle].value = values[handle].replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
        });
        rangeArea1.addEventListener('change', function () {
            sliderArea.noUiSlider.set([this.value, null]);
        });
        rangeArea2.addEventListener('change', function () {
            sliderArea.noUiSlider.set([null, this.value]);
        });
    }
    //изменение цены в карточке справа
    function getPrice(arrApartment) {
        let price = {};
        price.priceMin = 999999999;
        price.priceMax = 0;
        price.priceM2Min = 999999999;
        price.priceM2Max = 0;
        price.areaMin = 999999999;
        price.areaMax = 0;
        for (let noteOne of arrApartment) {
            (price.priceMin > noteOne.price) && (price.priceMin = noteOne.price-1);
            (price.priceMax < noteOne.price) && (price.priceMax = noteOne.price+1);
            (price.priceM2Min > noteOne.priceM2) && (price.priceM2Min = noteOne.priceM2-1);
            (price.priceM2Max < noteOne.priceM2) && (price.priceM2Max = noteOne.priceM2+1);
            (price.areaMin > noteOne.totalArea) && (price.areaMin = noteOne.totalArea-1);
            (price.areaMax < noteOne.totalArea) && (price.areaMax = noteOne.totalArea+1);
        }
        let priceReturn = Object.assign({}, price);
        if (price.priceMax == 0) {
            $('.card-mini-statistics__price .price-min').text('0');
            $('.card-mini-statistics__price .price-max').text('0');
            $('.card-mini-statistics__priceM2 .priceM2-min').text('0');
            $('.card-mini-statistics__priceM2 .priceM2-max').text('0');
        } else {
            price.priceMin = (price.priceMin/1000000).toFixed(1);
            price.priceMax = (price.priceMax/1000000).toFixed(1);
            price.priceM2Min = String(price.priceM2Min).replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
            price.priceM2Max = String(price.priceM2Max).replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
            $('.card-mini-statistics__price .price-min').text(price.priceMin);
            $('.card-mini-statistics__price .price-max').text(price.priceMax);
            $('.card-mini-statistics__priceM2 .priceM2-min').text(price.priceM2Min);
            $('.card-mini-statistics__priceM2 .priceM2-max').text(price.priceM2Max);
        }
        return priceReturn;
    }
    //получение квартир по заданой фильтрации
    function getArrApartment(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax) {
        let arrApartmentFilter = [],
            arrIndex = 0;
        for (let noteOne of arrApartment) {
            if (fRooms == undefined) {
                if (noteOne.price > Number(fPriceMin) && noteOne.price < Number(fPriceMax) && noteOne.totalArea > Number(fAreaMin) && noteOne.totalArea < Number(fAreaMax)) {
                    arrApartmentFilter[arrIndex] =  noteOne;
                    arrIndex++;
                }
            } else {
                if (noteOne.filterRooms == fRooms && noteOne.price > Number(fPriceMin) && noteOne.price < Number(fPriceMax) && noteOne.totalArea > Number(fAreaMin) && noteOne.totalArea < Number(fAreaMax)) {
                    arrApartmentFilter[arrIndex] =  noteOne;
                    arrIndex++;
                }
            }
        } 
        $('.filter-button-show span').text(arrApartmentFilter.length);
        return arrApartmentFilter;
    };
    //get params
    function getFiltrParam(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax) {
        fRooms = $('.selected-room').attr('data-btn-filter'),
        fPriceMin = $('#price-range-1').val().replace(/(\s){1,}/g, ''),
        fPriceMax = $('#price-range-2').val().replace(/(\s){1,}/g, ''),
        fAreaMin = $('#area-range-1').val().replace(/(\s){1,}/g, ''),
        fAreaMax = $('#area-range-2').val().replace(/(\s){1,}/g, '');
        return getArrApartment(arrApartment, fRooms, fPriceMin, fPriceMax, fAreaMin, fAreaMax);
    }
    //пагинация
    function pagination(arrApartment, paginationLi, notesOnPage) {
        for (let item of paginationLi) {
            item.addEventListener('click', function(){
                let pageNum = +$(this).find('span').text(),
                    start = (pageNum - 1) * notesOnPage,
                    end = start + notesOnPage,
                    notes = arrApartment.slice(start, end); //полученая коллекция на выбраной странице
                paginationLi.removeClass('active');
                $(this).addClass('active');
                //disabled arrow
                if ($(this).next().hasClass('paginationArrow')) {
                    $(this).next().addClass('disabled');
                } else { 
                    $('.paginationArrow').removeClass('disabled')
                }
                //handlebars
                $('#wrapper-all-apartment .wrapper-apartment').remove();
                for (let note of notes) {
                    let wrapperApartment = $('#wrapper-all-apartment');
                    let source = $("#template-apartment").html(),
                        template = Handlebars.compile(source),
                        html = template(note);
                    wrapperApartment.append(html);
                    //деление цен на разряды
                    $('.column-price, .info-apartment__price-size .price, .additional-info-body .price').each(function(i, el){
                        let price = $(el).text();
                        price = price.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
                        $(el).text(price)
                    })
                }
                openCard();
                validation();
                $('.like').on('click', function(event) {
                    event.stopPropagation();
                    $(this).toggleClass('like-fill');
                })
            })
        }
    };
    //create pagination
    function createPag(paginationArrow, countNumPag) {
        paginationArrow.closest('#pagination').find('li:not(.paginationArrow)').remove();
        countNumPag < 2 ? paginationArrow.addClass('disabled') : paginationArrow.removeClass('disabled');
        for (let i = 0; i < countNumPag; i++) {
            numPage = i + 1;
            numPage == 1 ? 
                paginationArrow.before('<li class="active"><span>' + numPage + '</span></li>') :
                paginationArrow.before('<li><span>' + numPage + '</span></li>')
        }
    };
    //раскрытие карточки квартиры с обновлением страницы
    function openCard() {
        $('.mini-apartment').on('click', function() {
            let miniCard = $(this),       
                idCard = $(this).attr('data-mini-card-id'),
                openCard = $(`.open-apartment[data-open-card-id="${idCard}"]`);
            //закрытие других
            $(`.open-apartment:not([data-open-card-id="${idCard}"])`).slideUp();
            $(`.mini-apartment:not([data-mini-card-id="${idCard}"])`).removeClass('dh-before, open-card');
            $(`.mini-apartment:not([data-mini-card-id="${idCard}"]) .open-card-icon`).css({transform: "rotate(0deg)", transition: ".6s transform", });
            $(`.mini-apartment:not([data-mini-card-id="${idCard}"]) .open-card-icon path`).css({fill: "#79818c", });
            $(`.wrapper-apartment:not(':has(.mini-apartment[data-mini-card-id="${idCard}"])')`).removeClass('ds-box-shadow');
            openCard.slideToggle();
            miniCard.toggleClass('dh-before');
            miniCard.closest('.wrapper-apartment').toggleClass('ds-box-shadow');

            miniCard.toggleClass('open-card');
            miniCard.hasClass('open-card') 
                ? miniCard.find('.open-card-icon').css({transform: "rotate(180deg)", transition: ".6s transform"}) && miniCard.find('.open-card-icon path').css({fill: "#367ee7", })
                : miniCard.find('.open-card-icon').css({transform: "rotate(0deg)", transition: ".6s transform"}) && miniCard.find('.open-card-icon path').css({fill: "#79818c", });
        })
    };
})