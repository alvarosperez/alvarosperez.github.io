var tr = {
    'drag':{ 'es': 'Suelta los archivos aquí', 'en': 'Drop files over here', 'pt': 'Solte os arquivos aquí'},
    'conf': { 'es': 'Configuración', 'en': 'Configuration', 'pt': 'Configuração'},
    'type': { 'es': 'Tipo de Visualización', 'en': 'Visualization type', 'pt': 'Tipo de visualização'},
    'treemap_sub': { 'es': 'Distribucion en rectángulos', 'en': 'Rectangle arrangement', 'pt': 'Distribuição em rectângulos'},
    'circle_sub': { 'es': 'Distribucion en círculos', 'en': 'Circle arrangement', 'pt': 'Distribuição em círculos'},
    'chord_sub': { 'es': 'Diagrama de cuerdas', 'en': 'Chord diagram', 'pt': 'Diagrama de cordas'},
    'map_sub': { 'es': 'Mapa cromático de regiones', 'en': 'Choropleth map', 'pt': 'Mapa coroplético'},
    'error_sub': { 'es': 'Formato inválido', 'en': 'Invalid format', 'pt': 'Formato inválido'},
    'error_main': { 'es': 'Error leyendo fichero', 'en': 'Error reading file', 'pt': 'Erro ao ler arquivo'},
    'export_error_sub': { 'es': 'Datos inválidos', 'en': 'Invalid data', 'pt': 'Dados inválidos'},
    'export_error_main': { 'es': 'Error exportando svg', 'en': 'Error exporting svg', 'pt': 'Erro svg exportação'},
    'color_scale': { 'es': 'Escala de colores', 'en': 'Colour scale', 'pt': 'Escala de cores'},
    'text_color': { 'es': 'Color texto', 'en': 'Text color', 'pt': 'Cor texto'},
    'first_scale': { 'es': '10 colores', 'en': '10 colours', 'pt': '10 cores'},
    'second_scale': { 'es': '20 colores(a)', 'en': '20 colours(a)', 'pt': '20 cores (a)'},
    'third_scale': { 'es': '20 colores(b)', 'en': '20 colours(b)', 'pt': '20 cores (b)'},
    'fourth_scale': { 'es': '20 colores(c)', 'en': '20 colours(c)', 'pt': '20 cores (c)'},
    'separator': {'es': 'Separador CSV', 'en': 'CSV separator', 'pt': 'Separador CSV'},
    'map_name_control': {'es': 'Mapa', 'en': 'Map', 'pt': 'Mapa'},
    'viz_controls': {'es': 'Controles', 'en': 'Controls', 'pt': 'Controles'},
    'new_version': {'es': 'Nueva versión disponible', 'en': 'New version available', 'pt': 'Nova versão disponível'},
    'new_version_2': {'es': 'Para conseguirla, escríbenos a ', 'en': 'Drop us a line at ', 'pt': 'Para obtê-lo, escreva-nos a '},
    'browser': {'es': 'Navegador NO soportado', 'en': 'Browser NOT supported', 'pt': 'Navegador não suportado'},
    'browser_2': {'es': 'Algunas funciones pueden no funcionar correctamente. Use Chrome', 'en': 'Some functions may not work properly. Use Chrome', 'pt': 'Alguns recursos podem não funcionar corretamente. Use Chrome'},
    '_tr': function(entry)
        {
            return this[entry][this._lang];
        }
};
