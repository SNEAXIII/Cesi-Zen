def session_mock(mocker):
    mock = mocker.AsyncMock()
    mock.add = mocker.MagicMock()
    mock.exec.return_value = mocker.MagicMock(return_value=None)
    return mock
