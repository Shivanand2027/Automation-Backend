import { createTwoFilesPatch } from 'diff';
import { logger } from '../utils/logger';

export class DiffGeneratorService {
  /**
   * Generate unified diff between two versions of a file
   */
  generateDiff(
    filePath: string,
    originalContent: string,
    modifiedContent: string
  ): string {
    try {
      const diff = createTwoFilesPatch(
        filePath, // old file name
        filePath, // new file name
        originalContent,
        modifiedContent,
        'Original',
        'Modified'
      );

      return diff;
    } catch (error: any) {
      logger.error('Error generating diff:', error.message);
      return '';
    }
  }

  /**
   * Generate multiple diffs for changed files
   */
  generateMultipleDiffs(
    changes: Array<{
      filePath: string;
      originalContent: string;
      modifiedContent: string;
    }>
  ): Array<{ filePath: string; diff: string }> {
    return changes.map(change => ({
      filePath: change.filePath,
      diff: this.generateDiff(
        change.filePath,
        change.originalContent,
        change.modifiedContent
      ),
    }));
  }

  /**
   * Parse diff to extract statistics
   */
  getDiffStats(diff: string): {
    additions: number;
    deletions: number;
    changes: number;
  } {
    const lines = diff.split('\n');
    let additions = 0;
    let deletions = 0;

    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;
      }
    }

    return {
      additions,
      deletions,
      changes: additions + deletions,
    };
  }

  /**
   * Format diff for display
   */
  formatDiffForDisplay(diff: string): {
    oldLines: Array<{ lineNum: number; content: string; type: 'normal' | 'deleted' }>;
    newLines: Array<{ lineNum: number; content: string; type: 'normal' | 'added' }>;
  } {
    const lines = diff.split('\n');
    const oldLines: Array<{ lineNum: number; content: string; type: 'normal' | 'deleted' }> = [];
    const newLines: Array<{ lineNum: number; content: string; type: 'normal' | 'added' }> = [];

    let oldLineNum = 0;
    let newLineNum = 0;
    let inHunk = false;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Hunk header - extract line numbers
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10) - 1;
          newLineNum = parseInt(match[2], 10) - 1;
          inHunk = true;
        }
      } else if (inHunk && !line.startsWith('---') && !line.startsWith('+++')) {
        if (line.startsWith('-')) {
          oldLines.push({
            lineNum: ++oldLineNum,
            content: line.substring(1),
            type: 'deleted',
          });
        } else if (line.startsWith('+')) {
          newLines.push({
            lineNum: ++newLineNum,
            content: line.substring(1),
            type: 'added',
          });
        } else {
          oldLines.push({
            lineNum: ++oldLineNum,
            content: line.substring(1),
            type: 'normal',
          });
          newLines.push({
            lineNum: ++newLineNum,
            content: line.substring(1),
            type: 'normal',
          });
        }
      }
    }

    return { oldLines, newLines };
  }
}

export const diffGeneratorService = new DiffGeneratorService();
