/**
 * Structure Insight Web - Main Application
 * Core application component and entry point with modular organization
 */

const { useState, useEffect, useRef, useCallback } = React;
const { LineNumbers, HighlightedContent, FileTree, Resizer, ScrollToTop, SettingsDialog } = window.Components;
const { useAppSettings, useDeviceDetection, useFileManagement, useUIInteractions } = window.Hooks;

//=============================================================================
// MAIN APPLICATION COMPONENT
//=============================================================================

/**
 * Main application component
 * Integrates all hooks and components
 */
const App = () => {
    //=========================================================================
    // HOOK INITIALIZATION
    //=========================================================================
    
    // App settings hook for theme, font size, etc.
    const { 
        isDarkTheme, 
        fontSize, 
        lineHeight, 
        extractContent, 
        toggleTheme, 
        increaseFontSize, 
        decreaseFontSize, 
        toggleExtractContent 
    } = useAppSettings();
    
    // Device detection hook for responsive behavior
    const { 
        isMobile, 
        isLandscape, 
        mobileView, 
        isTransitioning, 
        mobileToggleRef, 
        toggleMobileView, 
        setMobileView, 
        setIsTransitioning, 
        isTabletLandscape 
    } = useDeviceDetection();
    
    // File management hook for handling files and content
    const { 
        fileStructure, 
        filesContent, 
        treeData, 
        currentContent, 
        filePositions, 
        processing, 
        progress, 
        maxProgress, 
        statusMessage, 
        lineCount, 
        charCount, 
        isDragging, 
        isEditing, 
        currentEditingFile, 
        isProcessingZip,
        zipProgress,
        resetContent, 
        cancelProcessing, 
        copyContent, 
        saveContent, 
        handleLocalFolderSelect, 
        handleReceivedFiles, 
        handleFileTreeSelect, 
        handleFileDelete, 
        handleEditContent, 
        dragDropHandlers, 
        setStatusMessage,
        clearCache
    } = useFileManagement(extractContent);
    
    // UI interactions hook for layout and scrolling
    const { 
        leftPanelWidth, 
        containerRef, 
        editorScrollRef, 
        lineNumbersRef, 
        appRef, 
        handleResizeUpdate, 
        handleMobileScroll, 
        scrollToTop 
    } = useUIInteractions();
    
    //=========================================================================
    // SETTINGS DIALOG STATE
    //=========================================================================
    
    // Settings dialog state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const openSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);
    
    const closeSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);
    
    //=========================================================================
    // EVENT HANDLERS AND EFFECTS
    //=========================================================================

    // Set up keyboard shortcuts
    useEffect(() => {
        return AppHelpers.setupKeyboardShortcuts({
            currentContent, 
            isEditing, 
            processing, 
            isMobile, 
            mobileView, 
            saveContent, 
            copyContent,
            handleEditContent, 
            isSettingsOpen,
            closeSettings, 
            editorScrollRef, 
            setIsTransitioning, 
            setMobileView
        });
    }, [
        currentContent, isEditing, processing, 
        isMobile, mobileView, saveContent, copyContent, 
        handleEditContent, isSettingsOpen,
        closeSettings, editorScrollRef, setIsTransitioning, setMobileView
    ]);

    // Mobile scroll event listener
    useEffect(() => {
        if (isMobile && editorScrollRef.current) {
            const editorElement = editorScrollRef.current;
            editorElement.addEventListener('scroll', handleMobileScroll);
            
            return () => {
                editorElement.removeEventListener('scroll', handleMobileScroll);
            };
        }
    }, [isMobile, editorScrollRef, handleMobileScroll]);

    // Set up drag and drop event listeners
    useEffect(() => {
        return AppHelpers.setupDragAndDrop({
            isEditing,
            dragDropHandlers,
            setMobileView,
            isMobile
        });
    }, [isEditing, dragDropHandlers, setMobileView, isMobile]);

    // Check if scroll-to-top button should be shown when content length changes
    useEffect(() => {
        if (isMobile && editorScrollRef.current) {
            const scrollHeight = editorScrollRef.current.scrollHeight;
            const clientHeight = editorScrollRef.current.clientHeight;
            
            // Only enable scroll button when content is long enough
            if (scrollHeight > clientHeight * 1.5) {
                handleMobileScroll();
            }
        }
    }, [isMobile, currentContent, editorScrollRef, handleMobileScroll]);

    //=========================================================================
    // WRAPPER FUNCTIONS FOR EVENTS
    //=========================================================================

    // 修改后的包装函数
    const handleLocalFolderSelectWrapper = () => {
        handleLocalFolderSelect(isMobile, setMobileView);
    };
    
    const handleFileTreeSelectWrapper = (node) => {
        handleFileTreeSelect(node, editorScrollRef, isMobile, setMobileView, isTransitioning, setIsTransitioning, lineHeight);
    };
    
    //=========================================================================
    // RENDERING HELPERS
    //=========================================================================

    // Mobile class names
    const { getLeftPanelClassNames, getRightPanelClassNames } = 
        AppHelpers.getMobilePanelClassNames(isMobile, mobileView, isTransitioning);

    //=========================================================================
    // MAIN RENDER
    //=========================================================================

    return (
        <>
            {/* Header with integrated buttons */}
            <div className="app-header">
                <div className="app-logo">
                    <img src="favicon_io/android-chrome-192x192.png" alt="Structure Insight Logo" />
                    <span>Structure Insight Web</span>
                    
                    {/* Mobile device controls in title bar */}
                    {isMobile && (
                        <div className="mobile-title-controls">
                            <button 
                                className="header-button" 
                                onClick={openSettings}
                                title="设置"
                            >
                                <i className="fas fa-cog"></i>
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="header-buttons">
                    <button 
                        className="header-button" 
                        onClick={handleLocalFolderSelectWrapper}
                        title="选择一个文件夹开始分析"
                        disabled={isEditing}
                    >
                        <i className="fas fa-folder-open"></i>
                        {isMobile && <span className="tooltip">选择文件夹</span>}
                    </button>
                    <button 
                        className="header-button" 
                        onClick={copyContent} 
                        disabled={!currentContent || isEditing}
                        title="复制全部内容到剪贴板"
                    >
                        <i className="fas fa-copy"></i>
                        {isMobile && <span className="tooltip">复制内容</span>}
                    </button>
                    <button 
                        className="header-button" 
                        onClick={saveContent} 
                        disabled={!currentContent || isEditing}
                        title="将内容保存为文本文件"
                    >
                        <i className="fas fa-save"></i>
                        {isMobile && <span className="tooltip">保存文件</span>}
                    </button>
                    <button 
                        className="header-button" 
                        onClick={resetContent} 
                        disabled={!currentContent || processing}
                        title="清空当前结果并重置"
                    >
                        <i className="fas fa-redo"></i>
                        {isMobile && <span className="tooltip">重置</span>}
                    </button>
                    <button 
                        className="header-button" 
                        onClick={cancelProcessing} 
                        disabled={!processing}
                        title="取消当前处理"
                    >
                        <i className="fas fa-stop"></i>
                        {isMobile && <span className="tooltip">取消</span>}
                    </button>
                    
                    {/* Settings button - only show on non-mobile */}
                    {!isMobile && (
                        <button 
                            className="header-button" 
                            onClick={openSettings}
                            title="设置"
                        >
                            <i className="fas fa-cog"></i>
                        </button>
                    )}
                </div>
            </div>
            
            <div 
                className={`container ${isDragging ? 'dragging' : ''}`} 
                ref={containerRef}
            >
                <div 
                    className={`left-panel ${getLeftPanelClassNames()}`} 
                    style={!isMobile || isTabletLandscape ? { width: `${leftPanelWidth}%` } : {}}
                >
                    <div className="code-editor">
                        <LineNumbers 
                            ref={lineNumbersRef}
                            content={currentContent} 
                            lineHeight={lineHeight}
                            fontSize={fontSize}
                        />
                        <div 
                            ref={editorScrollRef}
                            className="highlighted-content" 
                            style={{ 
                                fontSize: `${fontSize}px`,
                                lineHeight: `${lineHeight}px` 
                            }}
                        >
                            <HighlightedContent 
                                content={currentContent}
                                fontSize={fontSize}
                                lineHeight={lineHeight}
                                isEditing={isEditing}
                                currentEditingFile={currentEditingFile}
                                onEditContent={handleEditContent}
                            />
                        </div>
                        
                        {/* 初始提示，移到左侧面板内部 */}
                        {!currentContent && !processing && (
                            <div className="initial-prompt left-panel-prompt">
                                <div 
                                    className="prompt-content" 
                                    onClick={handleLocalFolderSelectWrapper}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="fas fa-folder-open"></i>
                                    <p>拖放文件夹到此处，或点击此处选择文件夹</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${Math.min(100, (progress / Math.max(1, maxProgress)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                {/* Resizable divider - only for non-mobile or tablet landscape */}
                {(!isMobile || isTabletLandscape) && (
                    <Resizer 
                        onResize={handleResizeUpdate} 
                        position={leftPanelWidth}
                        isVertical={true}
                    />
                )}
                
                <div 
                    className={`right-panel ${getRightPanelClassNames()}`}
                    style={!isMobile || isTabletLandscape ? { width: `${100 - leftPanelWidth}%` } : {}}
                >
                    <FileTree 
                        nodes={treeData} 
                        onFileSelect={handleFileTreeSelectWrapper}
                        onFileDelete={handleFileDelete}
                    />
                </div>
            </div>
            
            {/* 更新状态栏显示 */}
            <div className="status-bar">
                {processing ? statusMessage : `${statusMessage} - 共 ${lineCount} 行, ${charCount} 字符`}
                {isEditing && !processing && " - 编辑模式"}
            </div>
            
            {/* Mobile view toggle button */}
            {isMobile && !isTabletLandscape && (
                <button 
                    ref={mobileToggleRef}
                    className="view-toggle"
                    onClick={toggleMobileView}
                    title={mobileView === 'editor' ? "切换到文件列表" : "切换到编辑器"}
                >
                    {mobileView === 'editor' ? 
                        <i className="fas fa-folder"></i> : 
                        <i className="fas fa-file-alt"></i>}
                </button>
            )}

            {/* Drop overlay */}
            {isDragging && (
                <div className="drop-overlay">
                    <div className="drop-message">
                        <i className="fas fa-upload"></i>
                        <span>释放鼠标以导入文件夹</span>
                    </div>
                </div>
            )}
            
            {/* ZIP extraction overlay */}
            {isProcessingZip && (
                <div className="zip-overlay">
                    <div className="zip-message">
                        <i className="fas fa-file-archive"></i>
                        <div className="zip-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                        <span>{zipProgress || '正在处理ZIP文件...'}</span>
                    </div>
                </div>
            )}
            
            {/* Mobile scroll to top button */}
            {isMobile && (
                <ScrollToTop targetRef={editorScrollRef} />
            )}
            
            {/* Settings dialog */}
            <SettingsDialog
                isOpen={isSettingsOpen}
                onClose={closeSettings}
                fontSize={fontSize}
                onIncreaseFontSize={increaseFontSize}
                onDecreaseFontSize={decreaseFontSize}
                isDarkTheme={isDarkTheme}
                onToggleTheme={toggleTheme}
                extractContent={extractContent}
                onToggleExtractContent={toggleExtractContent}
                onClearCache={clearCache}
            />
        </>
    );
};

//=============================================================================
// APPLICATION INITIALIZATION
//=============================================================================

// Render the application
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);