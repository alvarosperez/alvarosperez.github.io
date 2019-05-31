var geo_data = {};

var map_conf = { 'spain':
                        {   'geo_data_key': "spain_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [39, -2.4],
                                'mapOptions': {
                                    'zoom': 6,
                                    'maxZoom': 12,
                                    'minZoom': 6
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.id;},
                                'name': function(d,i) { return d.properties.nombre;}
                            }
                        },
                'uk':
                        {   'geo_data_key': "uk_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [55, -1],
                                'mapOptions': {
                                    'zoom': 5,
                                    'maxZoom': 12,
                                    'minZoom': 5
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.id;},
                                'name': function(d,i) { return d.properties.nombre;}
                            }
                        },
                'brazil':
                        {   'geo_data_key': "brazil_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [-15.7833, -47.8667],
                                'mapOptions': {
                                    'zoom': 4,
                                    'maxZoom': 12,
                                    'minZoom': 4
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.properties.ID_1;},
                                'name': function(d,i) { return d.properties.nombre;}
                            }
                        },
                'argentina':
                        {   'geo_data_key': "argentina_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [-35.7833, -64.8667],
                                'mapOptions': {
                                    'zoom': 4,
                                    'maxZoom': 12,
                                    'minZoom': 4
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.id;},
                                'name': function(d,i) { return d.properties.nombre;}
                            }
                        },
                'venezuela':
                        {   'geo_data_key': "venezuela_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [5, -66.9667],
                                'mapOptions': {
                                    'zoom': 6,
                                    'maxZoom': 12,
                                    'minZoom': 4
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.properties.HASC_1;},
                                'name': function(d,i) { return d.properties.NAME_1;}
                            }
                        },
                'mexico':
                        {   'geo_data_key': "mexico_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [19, -99.1333],
                                'mapOptions': {
                                    'zoom': 5,
                                    'maxZoom': 12,
                                    'minZoom': 4
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.properties.ID;},
                                'name': function(d,i) { return d.properties.name;}
                            }
                        }
                        ,
                 'ecuador':
                        {   'geo_data_key': "ecuador_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [-0.1500, -78.3500],
                                'mapOptions': {
                                    'zoom': 6,
                                    'maxZoom': 12,
                                    'minZoom': 1
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.properties.diss_me;},
                                'name': function(d,i) { return d.properties.name;}
                            }
                        },
                'peru':
                        {   'geo_data_key': "peru_geo",
                            'base_map': 'CartoDB.Positron',
                            'vizOptions': {
                                'initLatLng': [-12, -77],
                                'mapOptions': {
                                    'zoom': 6,
                                    'maxZoom': 12,
                                    'minZoom': 4
                                },
                                'hideOnZoom': true
                            },
                            'callbacks': {
                                'id': function(d,i) { return d.id;},
                                'name': function(d,i) { return d.properties.nombre;}
                            }
                        }
                };
