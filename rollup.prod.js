import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
	{
		input: 'angular-legacy-sortable.src.js',
		external: [
			'angular'
		],
		output: {
			name: 'wisboo-sortable',
			file: 'angular-legacy-sortable.js',
			format: 'cjs',
		},
		plugins: [
			resolve(),
    	commonjs()
		]
	}
];
