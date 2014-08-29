function selectRibbon( _name ){
	$('.ribbon_tab_selected').each( function(){
		$(this).removeClass( 'ribbon_tab_selected' )
			.addClass( 'ribbon_tab' );
	});
	
	$('.ribbon').each(function(){
		$(this).hide();
	});
	
	$('#' + _name).show();
	$('#tab_' + _name).removeClass( 'ribbon_tab' )
		.addClass( 'ribbon_tab_selected' );
}

function changeFontSelect( _value ){
	$('#selected_font_family').html( _value );
	$('#selected_font_family').css( "font-family", "'" + _value + "'" );
	$('#tb_font_family').hide();
}

function openFont(e){
	$( document ).on( "mousemove", function( e ) {
		var mouseTop = e.pageY;
		var mouseLeft = e.pageX;
		
		mouseTop += 40;
		mouseLeft -= ( $('#wandering_font_style').width() / 2 );
		
		$('#wandering_font_style').css({ top: mouseTop, left: mouseLeft })
		$('#wandering_font_style').show();
		$(document).off( "mousemove" );
	});
	
}

function closeFont(){
	$('#wandering_font_style').hide();
}

function fontStyleStyleClick( _style, _character ){
	var value = $('#font_style_style').val();
	value = value.replace( _character, '' );
	
	if( $('#' + _style).hasClass( 'font_style_style' ) ){
		$('#' + _style).addClass( 'font_style_style_selected' )
			.removeClass('font_style_style');
		
		value += _character;
	} else {
		$('#' + _style).removeClass( 'font_style_style_selected' )
			.addClass('font_style_style');
	}
	
	$('#font_style_style').val( value );
}
