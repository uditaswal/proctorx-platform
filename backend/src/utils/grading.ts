export const gradeMCQAnswer = (userAnswer: string, correctAnswer: string): {
  isCorrect: boolean;
  points: number;
} => {
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  return {
    isCorrect,
    points: isCorrect ? 1 : 0
  };
};

export const gradeCodeSubmission = async (
  code: string,
  languageId: number,
  testCases: Array<{ input: string; expected_output: string; description?: string }>,
  totalPoints: number = 1
): Promise<{
  isCorrect: boolean;
  points: number;
  passedTests: number;
  totalTests: number;
  testResults: Array<{
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    description?: string;
  }>;
}> => {
  const { submitCode } = await import('./judge0');
  const testResults = [];
  let passedTests = 0;

  for (const testCase of testCases) {
    try {
      const result = await submitCode(code, languageId, testCase.input);
      const actualOutput = result.stdout?.trim() || '';
      const expectedOutput = testCase.expected_output.trim();
      const passed = actualOutput === expectedOutput;

      if (passed) passedTests++;

      testResults.push({
        passed,
        input: testCase.input,
        expectedOutput,
        actualOutput,
        description: testCase.description
      });

    } catch (error) {
      testResults.push({
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        actualOutput: 'Execution Error',
        description: testCase.description
      });
    }
  }

  const passRate = passedTests / testCases.length;
  const points = passRate * totalPoints;
  const isCorrect = passRate >= 0.8; // 80% pass rate required

  return {
    isCorrect,
    points,
    passedTests,
    totalTests: testCases.length,
    testResults
  };
};
