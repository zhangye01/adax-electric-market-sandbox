# Legacy ADAX v0 Prototype Utilities

This directory preserves earlier broad ADAX prototype utilities, including inactive retailer and thermal calculations plus old template parsing helpers.

They are not part of the active ADAX v0.1 retail baseline. Current active code should use:

- `src/domain/retailCalculations.ts` for retail settlement logic.
- `src/services/retailExecutionTemplates.ts` for active retail template import/export.
- `src/utils/formatters.ts` for display formatting.
- `src/utils/download.ts` for browser file download.

Do not import these legacy utilities into active code. Migrate needed behavior into active domain or service modules with tests first.
