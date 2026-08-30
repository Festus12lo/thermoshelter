# DEEP LEARNING READINESS AUDIT

## Scientific Justification
- **MLP / Neural Surrogate**: REJECTED. The dataset dimensionality (approx 28 features) and tabular nature heavily favor tree-based ensembles (Random Forests, Gradient Boosting) which prevent overfitting and allow exact feature importance tracing.
- **Graph Neural Networks (GNN) / CFD**: FUTURE. Deep learning is only justified for replacing complex 3D Navier-Stokes CFD simulations, which are currently out of scope for V2.

## Roadmap
Deep Learning should only be integrated when training data reaches $>10^6$ CFD meshed simulations. Current Models A-D provide superior engineering safety.

## Verdict
NOT IMPLEMENTED (By Design). Tree-based models retained for scientific validity and traceability.
