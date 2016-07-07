module.exports = (grunt) => {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        secret: grunt.file.readJSON('secret.json'),
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
                src: ['src/*.js']
            }
        },
    });
    grunt.registerTask('default', ['gitinfo', 'eslint', 'screeps']);
};
