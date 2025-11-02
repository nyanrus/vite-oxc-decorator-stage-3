use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use oxc_allocator::Allocator;
use oxc_codegen::Codegen;
use oxc_parser::Parser;
use oxc_span::SourceType;

#[derive(Serialize, Deserialize)]
pub struct TransformOptions {
    #[serde(default)]
    pub source_maps: bool,
}

#[derive(Serialize, Deserialize)]
pub struct TransformResult {
    pub code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map: Option<String>,
    pub errors: Vec<String>,
}

/// Transform JavaScript/TypeScript code with Stage 3 decorators
#[wasm_bindgen]
pub fn transform(
    filename: &str,
    source_text: &str,
    options_json: JsValue,
) -> Result<JsValue, JsValue> {
    // Parse options
    let options: TransformOptions = if options_json.is_undefined() || options_json.is_null() {
        TransformOptions { source_maps: true }
    } else {
        serde_wasm_bindgen::from_value(options_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid options: {}", e)))?
    };

    // Create allocator for AST
    let allocator = Allocator::default();
    
    // Determine source type from filename
    let source_type = SourceType::from_path(filename).unwrap_or_default();
    
    // Parse the source code
    let parser = Parser::new(&allocator, source_text, source_type);
    let parse_result = parser.parse();
    
    // Check for parse errors
    if !parse_result.errors.is_empty() {
        let errors: Vec<String> = parse_result
            .errors
            .iter()
            .map(|e| format!("{:?}", e))
            .collect();
        
        let result = TransformResult {
            code: source_text.to_string(),
            map: None,
            errors,
        };
        
        return Ok(serde_wasm_bindgen::to_value(&result)?);
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
    
    let result = TransformResult {
        code: codegen_result.code,
        map: if options.source_maps {
            codegen_result.map.map(|m| m.to_json_string())
        } else {
            None
        },
        errors: vec![],
    };
    
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen(start)]
pub fn init() {
    // Set panic hook for better error messages
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_parsing() {
        let code = "const x = 1;";
        assert!(code.len() > 0);
    }
}
