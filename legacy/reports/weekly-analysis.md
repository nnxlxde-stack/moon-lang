async (b) => {
        const report = `# Combined Report
${JSON.stringify({ a, b })}`;
        ctx.effects.push({ kind: "generateCombinedReport", detail: { length: report.length } });
        return report;
      }