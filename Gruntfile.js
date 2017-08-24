module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ngconstant: {
			options: {
				name: 'originacion.constants',
				dest: 'js/constants.js'
			},
			development: {
				constants: {
					ENV: 'development',
					SERVICE_URL: 'http://15.128.25.221:7027/mortgagequote/',
		      	}
			},
			production: {
				constants: {
					ENV: 'production',
		        	SERVICE_URL: 'https://www.banorte.com/mortgagequote/',
		      	}
			}
		},
    eslint: {
      target: [
        'hipoteca/*.js',
        'hipoteca/**/*.js',
        'pyme/*.js',
        'pyme/**/*.js'
      ]
    },
    clean: ['hipoteca/sass/build.scss'],
    concat: {
       dist: {
         src: [
           'hipoteca/sass/*.scss',
         ],
         dest: 'hipoteca/sass/build.scss',
       }
     },
    sass: {
  		options: {
  			sourceMap: true
  		},
  		dist: {
  			files:
        {
  				'hipoteca/css/style.css': 'hipoteca/sass/build.scss'
  			}
  		}
  	}
  });

  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');
  grunt.registerTask('default', ['ngconstant:development', 'eslint', 'clean', 'concat', 'sass']);
};
