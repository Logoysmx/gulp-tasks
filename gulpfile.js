/*
*Dependencias (previamente instaladas desde npm e incluidas en package.json)
*/
const 
	gulp				= require('gulp')
	sass				= require('gulp-sass'),
	cleanCss			= require('gulp-clean-css'),
	sourcemaps			= require('gulp-sourcemaps'),
	rename				= require('gulp-rename'),
	gulpNgConfig 		= require('gulp-ng-config'),
	browserSync 		= require('browser-sync').create(),
	gutil				= require('gulp-util'),
	uglify				= require('gulp-uglify'),
	pump				= require('pump'),
	merge 				= require('merge-stream'),
	pathsReader 		= require('path'),
	fs 					= require('fs'),
	concat 				= require('gulp-concat'),
	environmentConfig 	= require('./enviroment.json');		//Configuración general del proyecto y entorno de trabajo

/*
*Directorio de archivos
*/
let paths = {
	sass: {
		config:{
			input_scss: 'hipoteca/sass/*.scss',
			output_dir: 'hipoteca/css',
			output_file_name: 'app.min.css',
			minify: false
		}
	},
	css: { 
		config: {
			input_css:'hipoteca/css/*.css',
			output_name_min: 'app.min.css',
			output_dir: 'css'
		} 
	},
	js: ['hipoteca/app'],
	config: {
		constants: {
			name:"constants.js", 
			output_dir: 'js'
		}
	}
};

/*
*Compilar SASS (archivos *scss)
*/
gulp.task('sass', function(){
	return gulp.src(paths.sass.config.input_scss)
	.pipe(sass().on('error', sass.logError))
	.pipe(sourcemaps.init())
	.pipe(paths.sass.config.minify ? cleanCss({compatibility: 'ie8'}) : cleanCss())
	.pipe(sourcemaps.write('hipoteca/maps'))
	.pipe(rename(paths.sass.config.output_file_name))
	.pipe(gulp.dest(paths.sass.config.output_dir));
});
/*
*Minificar archivos JavaScript
*/




var scriptsPath = 'hipoteca/app';

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(pathsReader.join(dir, file)).isDirectory();
      });
}

gulp.task('scripts', function() {
   var folders = getFolders(scriptsPath);

   var tasks = folders.map(function(folder) {
      return gulp.src(pathsReader.join(scriptsPath, folder, '/**/*.js'))
        // concat into foldername.js
        .pipe(concat(folder + "/" + folder + '.js'))
        // write to output
        .pipe(gulp.dest(scriptsPath)) 
        // minify
        .pipe(uglify())    
        // rename to folder.min.js
        .pipe(rename(folder + "/" + folder + '.min.js')) 
        // write to output again
        .pipe(gulp.dest(scriptsPath));    
   });

   // process all remaining files in scriptsPath root into main.js and main.min.js files
   var root = gulp.src(pathsReader.join(scriptsPath, '/*.js'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(scriptsPath))
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest(scriptsPath));

   return merge(tasks, root);
});





/*
*NOTA: Se debe compilar previamente todos los archivos SASS/SCSS
*Minifica los archivos ya compilados a CSS, es una tarea externa al compilado de SASS que se puede usar de manera independiente
*/
gulp.task('css', function(){
	return gulp.src(paths.css.config.input_css)
	.pipe(sass().on('error', sass.logError))
	.pipe(cleanCss({compatibility: 'ie8'}))
	.pipe(sourcemaps.write())
	.pipe(rename(paths.css.config.output_name_min))
	.pipe(gulp.dest(paths.css.config.output_dir));
});

/*
*Configuración del entorno para angular
*Genera el archivo constants.js
*/
gulp.task('setEnviroment', function () {	
	gulp.src('enviroment.json')
	.pipe(gulpNgConfig('originacion.constants', {
		environment: 'env.development'
	}))
	.pipe(rename(paths.config.constants.name))
	.pipe(gulp.dest(paths.config.constants.output_dir, {
		overwrite:true
	}))
});

/*
*Watchers
*/
gulp.task('watch', ['sass'], function(){
	//Escuchar el directorio de sass y la tarea definida
	gulp.watch(paths.sass, ['sass']);
});

/*
*Server
*Se utiliza la variable env de la dependencia gulp-util
*Ejemplo: gulp browser-sync --mod development/production
*/
gulp.task('browser-sync', function() {
	/*
	*Para correr en ambientes diferentes usando el flag --mod developmet/production se setea la variable option
	*en caso de no estar seteada, por default será un ambiente de desarrollo (development).
	*La tarea puede ser llamada de manera independiente con la linea gulp browser-sync --mod development/production
	*/
	let option = 'development'; //Ambiente de desarrollo por default

	if( !!gutil.env.initmod ){
		option = gutil.env.initmod;
	}else if( !!gutil.env.mod ){
		option = gutil.env.mod;
	}

	browserSync.init({
		server: environmentConfig.path_app,
		port: option.trim().toLowerCase() === 'development' ? environmentConfig.env.development.PORT : environmentConfig.env.production.PORT
	});

});

/*
*Init tasks
*Ejemplo: gulp init --initmod development/production
*/
gulp.task('init', ['setEnviroment', 'browser-sync']);