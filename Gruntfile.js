module.exports = (grunt) => {
    require('load-grunt-tasks')(grunt);
    let secret = null;
    if(grunt.file.exists('secret.json')) {
        secret = grunt.file.readJSON('secret.json');
    }
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        secret: secret,
        eslint: {
            target: ['src/']
        },
        screeps: {
            options: {
                email: '<%= secret.email %>',
                password: '<%= secret.password %>',
                branch: '<%= gitinfo.local.branch.current.name %>',
                ptr: false
            },
            dist: {
                src: ['src/**/*.js']
            }
        },
    });
    grunt.registerTask('test', ['gitinfo', 'eslint']);
    grunt.registerTask('default', ['gitinfo', 'eslint', 'screeps']);
};
