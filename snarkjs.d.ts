declare namespace snarkjs {
	namespace groth16 {
		async function fullProve(
			input: Record<string, string | string[]>,
			wasmPath: string,
			zkeyPath: string
		): Promise<{ publicSignals: string[]; proof: {} }>

		async function verify(
			verificationKey: {},
			publicSignals: string[],
			proof: {}
		): Promise<boolean>
	}
}
