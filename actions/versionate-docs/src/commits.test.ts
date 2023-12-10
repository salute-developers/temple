import { getDocPackages } from './commits';

const commits = [
    'chore: Message',
    'docs: Message',
    'Bad commit',
    'fix!: Message [skip ci]',
    'docs(plasma-temple): Message',
];
const unique = ['plasma-temple-docs'];

describe('commits.ts', () => {
    it('getDocPackages', () => {
        expect(getDocPackages(commits)).toStrictEqual(unique);
    });
});
