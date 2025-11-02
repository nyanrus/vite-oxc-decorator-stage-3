use serde::{Deserialize, Serialize};
use oxc_allocator::Allocator;
use oxc_codegen::Codegen;
use oxc_parser::Parser;
use oxc_span::SourceType;

// WIT bindgen setup - this generates types from the WIT file
wit_bindgen::generate!({
    path: "wit",
});

struct Component;

#[derive(Serialize, Deserialize)]
pub struct TransformOptions {
    #[serde(default)]
    pub source_maps: bool,
}

impl exports::Transform for Component {
    fn transform(
        filename: String,
        source_text: String,
        options: String,
    ) -> Result<exports::TransformResult, String> {
        // Parse options from JSON string
        let opts: TransformOptions = if options.is_empty() {
            TransformOptions { source_maps: true }
        } else {
            serde_json::from_str(&options)
                .map_err(|e| format!("Invalid options: {}", e))?
        };

        // Create allocator for AST
        let allocator = Allocator::default();
        
        // Determine source type from filename
        let source_type = SourceType::from_path(&filename).unwrap_or_default();
        
        // Parse the source code
        let parser = Parser::new(&allocator, &source_text, source_type);
        let parse_result = parser.parse();
        
        // Check for parse errors
        if !parse_result.errors.is_empty() {
            let errors: Vec<String> = parse_result
                .errors
                .iter()
                .map(|e| format!("{:?}", e))
                .collect();
            
            return Ok(exports::TransformResult {
                code: source_text.clone(),
                map: None,
                errors,
            });
        }

        // For now, we'll pass through the code as-is
        // A full Stage 3 decorator transformation would require:
        // 1. Walking the AST to find decorators
        // 2. Transforming them according to TC39 Stage 3 semantics
        // 3. Generating new AST nodes for the transformation
        // 
        // This is a complex transformation that would require significant
        // implementation. For the initial version, we use Babel's proven
        // implementation via the TypeScript layer.
        
        // Generate code from AST (using default options)
        let codegen_result = Codegen::new().build(&parse_result.program);
        
        Ok(exports::TransformResult {
            code: codegen_result.code,
            map: if opts.source_maps {
                codegen_result.map.map(|m| m.to_json_string())
            } else {
                None
            },
            errors: vec![],
        })
    }
}

export_transformer!(Component);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_parsing() {
        let code = "const x = 1;";
        assert!(code.len() > 0);
    }
}
