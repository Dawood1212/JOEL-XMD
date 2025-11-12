def test_import_assistant():
    import assistant
    assert hasattr(assistant, "__version__")
