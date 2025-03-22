import { describe, expect, test, vi, beforeEach } from 'vitest';
import { generateStaticPaths } from '../../src/lib/utils/staticPaths';
import * as fs from 'fs';
import * as path from 'path';

// Set up vitest mocks
vi.mock('fs');
vi.mock('path');

describe('Static Paths Generator Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock process.cwd() to return a predictable path
    vi.spyOn(process, 'cwd').mockReturnValue('/test');
    
    // Set up default mock implementations
    vi.mocked(path.join).mockImplementation((...args: string[]) => args.join('/'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  test('returns empty array when content directory does not exist', () => {
    // Mock fs.existsSync to return false for the content directory
    vi.mocked(fs.existsSync).mockReturnValue(false);
    
    const paths = generateStaticPaths();
    
    expect(paths).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });
  
  test('generates correct paths for base content files', () => {
    // Mock fs.existsSync to return true for the content directory
    vi.mocked(fs.existsSync).mockReturnValue(true);
    
    // Mock readdirSync for base content directory to return some markdown files
    vi.mocked(fs.readdirSync).mockImplementation((dir: any, options?: any): any => {
      if (dir === '/test/content' && !options) {
        return ['getting-started.md', 'about.md', 'contact.md'];
      }
      
      if (dir === '/test/content' && options?.withFileTypes) {
        return [];
      }
      
      return [];
    });
    
    const paths = generateStaticPaths();
    
    // Expect to have just the base content files (no directories or chapters)
    expect(paths).toEqual([
      { slug: 'getting-started' },
      { slug: 'about' },
      { slug: 'contact' }
    ]);
  });
  
  test('generates correct paths for book chapters and verses', () => {
    // Mock process.cwd() to return a predictable path
    vi.spyOn(process, 'cwd').mockReturnValue('/test');
    
    // Mock fs.existsSync to return true for the content directory
    vi.mocked(fs.existsSync).mockReturnValue(true);
    
    // Create mock directory entries
    const mockDirEnt = (name: string, isDir: boolean): fs.Dirent => ({
      name,
      isDirectory: () => isDir,
      isFile: () => !isDir,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isFIFO: () => false,
      isSocket: () => false,
      isSymbolicLink: () => false
    });
    
    // Mock readdirSync to handle different calls
    vi.mocked(fs.readdirSync).mockImplementation((dir: string, options?: any): any => {
      // Root content directory with no options (simple file list)
      if (dir === '/test/content' && !options) {
        return ['getting-started.md', 'genesis'];
      }
      
      // Root content directory with options (directory entries)
      if (dir === '/test/content' && options?.withFileTypes) {
        return [
          mockDirEnt('getting-started.md', false),
          mockDirEnt('genesis', true)
        ];
      }
      
      // Genesis directory
      if (dir === '/test/content/genesis') {
        return ['1.md', '2.md'];
      }
      
      return [];
    });
    
    const paths = generateStaticPaths();
    
    // Check the base content file
    expect(paths).toContainEqual({ slug: 'getting-started' });
    
    // Check chapter paths
    expect(paths).toContainEqual({ slug: 'genesis/1' });
    expect(paths).toContainEqual({ slug: 'genesis/2' });
    
    // Check verse paths (first few for each chapter)
    expect(paths).toContainEqual({ slug: 'genesis/1/1' });
    expect(paths).toContainEqual({ slug: 'genesis/1/2' });
    expect(paths).toContainEqual({ slug: 'genesis/2/1' });
    expect(paths).toContainEqual({ slug: 'genesis/2/2' });
    
    // Check total count (1 base file + 2 chapters + 60 verses (30 per chapter))
    expect(paths.length).toBe(63);
  });
});
